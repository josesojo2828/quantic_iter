import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8'),
          );
          
          (req as any).user = {
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId,
          };
        }
      } catch (e) {
        console.error('[Audit AuthMiddleware] Error decoding token:', e.message);
      }
    }
    next();
  }
}
