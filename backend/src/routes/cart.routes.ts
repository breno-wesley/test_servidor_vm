import { Router, Response } from 'express';
import { dbGet, dbRun, dbAll } from '../database/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Get or create cart
    let cart: any = await dbGet('SELECT * FROM carts WHERE user_id = ?', req.userId!);

    if (!cart) {
      const result: any = await dbRun('INSERT INTO carts (user_id) VALUES (?)', req.userId!);
      cart = { id: result.lastID, user_id: req.userId };
    }

    // Get cart items with product details
    const items = await dbAll(`
      SELECT 
        ci.id,
        ci.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.image_url,
        p.stock,
        (ci.quantity * p.price) as subtotal
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, cart.id);

    const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    res.json({ cart: { ...cart, items, total } });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
});

// Add item to cart
router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'ID do produto é obrigatório' });
    }

    // Check product exists and has stock
    const product: any = await dbGet('SELECT * FROM products WHERE id = ?', product_id);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }

    // Get or create cart
    let cart: any = await dbGet('SELECT * FROM carts WHERE user_id = ?', req.userId!);
    if (!cart) {
      const result: any = await dbRun('INSERT INTO carts (user_id) VALUES (?)', req.userId!);
      cart = { id: result.lastID };
    }

    // Check if item already in cart
    const existingItem: any = await dbGet(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      cart.id,
      product_id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
      }

      await dbRun('UPDATE cart_items SET quantity = ? WHERE id = ?', newQuantity, existingItem.id);
    } else {
      await dbRun(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        cart.id,
        product_id,
        quantity
      );
    }

    res.status(201).json({ message: 'Item adicionado ao carrinho' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Erro ao adicionar item ao carrinho' });
  }
});

// Update cart item quantity
router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }

    // Get cart item
    const item: any = await dbGet(`
      SELECT ci.*, c.user_id, p.stock
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ?
    `, id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (item.user_id !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (item.stock < quantity) {
      return res.status(400).json({ error: 'Estoque insuficiente' });
    }

    await dbRun('UPDATE cart_items SET quantity = ? WHERE id = ?', quantity, id);

    res.json({ message: 'Quantidade atualizada' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// Remove item from cart
router.delete('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const item: any = await dbGet(`
      SELECT ci.*, c.user_id
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ?
    `, id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    if (item.user_id !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await dbRun('DELETE FROM cart_items WHERE id = ?', id);

    res.json({ message: 'Item removido do carrinho' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// Checkout - Create sale and clear cart
router.post('/checkout', async (req: AuthRequest, res: Response) => {
  try {
    // Get cart with items
    const cart: any = await dbGet('SELECT * FROM carts WHERE user_id = ?', req.userId!);

    if (!cart) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    const items: any[] = await dbAll(`
      SELECT ci.*, p.name, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, cart.id);

    if (items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // Check stock for all items
    for (const item of items) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para ${item.name}` });
      }
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create sale
    const saleResult: any = await dbRun(
      'INSERT INTO sales (user_id, total) VALUES (?, ?)',
      req.userId!,
      total
    );
    const saleId = saleResult.lastID;

    // Create sale items and update stock
    for (const item of items) {
      await dbRun(
        'INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        saleId,
        item.product_id,
        item.name,
        item.quantity,
        item.price
      );
      
      await dbRun('UPDATE products SET stock = stock - ? WHERE id = ?', item.quantity, item.product_id);
    }

    // Clear cart
    await dbRun('DELETE FROM cart_items WHERE cart_id = ?', cart.id);

    res.json({ 
      message: 'Compra finalizada com sucesso',
      sale: {
        id: saleId,
        total,
        items: items.length
      }
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Erro ao finalizar compra' });
  }
});

export default router;
