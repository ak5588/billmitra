import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization as string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && (req.query as any).token) {
    token = (req.query as any).token as string;
  }
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const secret = process.env.JWT_SECRET || '';
  try {
    const payload = jwt.verify(token, secret) as any;
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
