import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import type { users } from '../db/schema.ts';

export interface AuthRequest extends Request {
  firebaseUser?: DecodedIdToken;
  dbUser?: typeof users.$inferSelect;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Authentication required. Empty token.' });
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.firebaseUser = decoded;

    const dbUser = await getOrCreateUser(
      decoded.uid,
      decoded.email ?? '',
      decoded.name ?? decoded.email ?? 'Student'
    );

    if (dbUser.isSuspended) {
      res.status(403).json({ error: 'Account is suspended. Contact platform support.' });
      return;
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    next();
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.firebaseUser = decoded;
    req.dbUser = await getOrCreateUser(
      decoded.uid,
      decoded.email ?? '',
      decoded.name ?? decoded.email ?? 'Student'
    );
  } catch {
    // Public route gracefully continues anonymously if optional token is invalid
  }
  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.dbUser) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.dbUser.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required.' });
    return;
  }
  next();
};
