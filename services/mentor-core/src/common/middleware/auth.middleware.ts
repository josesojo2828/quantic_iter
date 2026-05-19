import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies.access_token || req.cookies.accessToken || req.cookies.jwt;
    }

    (req as any).scope = {}; 
    
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8'),
          );
          
          console.log('[AuthMiddleware] Decoded TenantId:', decoded.tenantId);

          (req as any).user = {
            sub: decoded.sub,
            email: decoded.email,
            role: decoded.role,
            tenantId: decoded.tenantId,
            mentorId: decoded.mentorId || decoded.sub,
          };

          (req as any).scope = {
            tenantId: decoded.tenantId,
            coachId: decoded.role === 'mentor' ? decoded.sub : undefined,
            roles: decoded.role ? [decoded.role] : [],
          };
        }
      } catch (e) {
        console.error('[AuthMiddleware] Error decoding token:', e.message);
      }
    } else {
      console.warn('[AuthMiddleware] No token found in Authorization header or cookies');
    }
    next();
  }
}
