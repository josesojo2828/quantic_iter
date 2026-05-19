import { Injectable } from '@nestjs/common';

@Injectable()
export class QrTokenService {
  private readonly secret = process.env.JWT_SECRET || 'mentor-secret-key';
  private jwt: any;

  constructor() {
    try {
      this.jwt = require('jsonwebtoken');
    } catch (e) {
      console.error('[QrTokenService] Error loading jsonwebtoken:', e.message);
    }
  }

  generateToken(payload: any): string {
    if (!this.jwt) return 'error-loading-library';
    
    return this.jwt.sign(
      { 
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 // 60 segundos de validez
      }, 
      this.secret
    );
  }

  verifyToken(token: string): any {
    if (!this.jwt) return null;
    
    try {
      return this.jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
