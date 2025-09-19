import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface NRequest extends Request {
  user?: any;
  headers: {
    [key: string]: any;
    authorization?: string;
  };
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<NRequest>();

    // Get token from Authorization header (Bearer token)
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('Authentication token is missing');
    }

    try {
      // Verify the token using the secret
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Use your secret key from .env file
      });

      // Attach the decoded user info to request
      request.user = decoded;
      if (request.user) {
        console.log('you are authorised');
      }
      // Check if the user has the 'admin' role
      // if (decoded.role !== 'admin') {
      //   throw new ForbiddenException('Access denied: Admins only');
      // }

      return true;
    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
