import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
  constructor(private authService: AuthService) {
    super();
    console.log('✅ CustomStrategy initialized');
  }

  async validate(req: Request): Promise<any> {
    const token = req.body?.token || req.headers['authorization'];

    console.log('🧩 Incoming token:', token);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const verify = await this.authService.verifyGoogleToken(token);
      console.log('✅ Google token verified:', verify);

      const user = await this.authService.login(verify);
      console.log('✅ User found in DB:', user);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      console.error('❌ Error in CustomStrategy.validate():', error);
      throw new UnauthorizedException('Invalid token or user not authorized');
    }
  }
}
