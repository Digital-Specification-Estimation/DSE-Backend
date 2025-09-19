import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();
interface NRequest extends Request {
  user?: any;
}
@Injectable()
export class AuthMiddleware implements NestMiddleware<NRequest, Response> {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: NRequest, res: Response, next: NextFunction) {
    // Get token from Authorization header (Bearer token)
    const token = req.headers.authorization?.split(' ')[1];
    console.log(token);
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      // Verify the token using the secret defined in the environment variable
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Ensure the secret key is loaded from .env
      });

      // Attach the decoded token (user information) to the request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
