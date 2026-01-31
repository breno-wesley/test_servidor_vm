import { Router, Response } from 'express';
import { dbAll, dbGet } from '../database/db';

const router = Router();

// Get all products
router.get('/', async (req, res: Response) => {
  try {
    const products = await dbAll('SELECT * FROM products ORDER BY name');
    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Get single product
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const product = await dbGet('SELECT * FROM products WHERE id = ?', id);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

export default router;
