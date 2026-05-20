import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Validates the Bearer access token from the Authorization header.
 * Attaches `userId` to the request on success.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JWTPayload;

    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'Access token is expired or invalid' },
    });
  }
}
