import { Router, Response } from 'express';
import { dbAll } from '../database/db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbAll(`
      SELECT id, email, name, is_admin, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Get all sales with user information
router.get('/sales', async (req: AuthRequest, res: Response) => {
  try {
    const sales: any[] = await dbAll(`
      SELECT 
        s.id,
        s.total,
        s.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM sales s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);

    // Get items for each sale
    const salesWithItems = await Promise.all(sales.map(async (sale: any) => {
      const items = await dbAll(`
        SELECT product_name, quantity, price
        FROM sale_items
        WHERE sale_id = ?
      `, sale.id);

      return { ...sale, items };
    }));

    res.json({ sales: salesWithItems });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas' });
  }
});

export default router;
