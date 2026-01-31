import { Router, Request, Response } from 'express';
import { dbGet, dbRun } from '../database/db';
import bcrypt from 'bcrypt';
import { authenticate, createSession, deleteSession, AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result: any = await dbRun(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      email,
      hashedPassword,
      name
    );

    const userId = result.lastID;

    // Create session
    const sessionId = await createSession(userId);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    const user = await dbGet('SELECT id, email, name, is_admin FROM users WHERE id = ?', userId);

    res.status(201).json({ user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user: any = await dbGet('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Create session
    const sessionId = await createSession(user.id);

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId) {
    await deleteSession(sessionId);
    res.clearCookie('sessionId');
  }

  res.json({ message: 'Logout realizado com sucesso' });
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  const user = await dbGet('SELECT id, email, name, is_admin FROM users WHERE id = ?', req.userId!);
  res.json({ user });
});

export default router;
