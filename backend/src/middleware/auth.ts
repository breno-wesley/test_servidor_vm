import { Request, Response, NextFunction } from 'express';
import { dbGet, dbRun } from '../database/db';
import crypto from 'crypto';

export interface AuthRequest extends Request {
  userId?: number;
  isAdmin?: boolean;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const session = await dbGet(`
    SELECT s.user_id, u.is_admin
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `, sessionId) as { user_id: number; is_admin: number } | undefined;

  if (!session) {
    res.clearCookie('sessionId');
    return res.status(401).json({ error: 'Sessão inválida ou expirada' });
  }

  req.userId = session.user_id;
  req.isAdmin = session.is_admin === 1;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await dbRun(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    sessionId,
    userId,
    expiresAt.toISOString()
  );

  return sessionId;
}

export async function deleteSession(sessionId: string) {
  await dbRun('DELETE FROM sessions WHERE id = ?', sessionId);
}
