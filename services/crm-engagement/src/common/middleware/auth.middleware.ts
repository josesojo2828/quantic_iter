import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let token: string | undefined;

    // 1. Try Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Try Cookie (access_token)
    else if (req.cookies && req.cookies['access_token']) {
      token = req.cookies['access_token'];
    }

    if (token) {
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
        console.error('[CRM AuthMiddleware] Error decoding token:', e.message);
      }
    }
    next();
  }
}
