import { Router, Response } from 'express';
import { dbAll } from '../database/db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get user's order history
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const sales: any[] = await dbAll(`
      SELECT id, total, created_at
      FROM sales
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, req.userId!);

    // Get items for each sale
    const salesWithItems = await Promise.all(sales.map(async (sale: any) => {
      const items = await dbAll(`
        SELECT product_name, quantity, price
        FROM sale_items
        WHERE sale_id = ?
      `, sale.id);

      return { ...sale, items };
    }));

    res.json({ orders: salesWithItems });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

export default router;
