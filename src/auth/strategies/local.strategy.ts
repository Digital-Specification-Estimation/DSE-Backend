import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';
import { PasswordService } from '../services/password.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }
  async validate(req: Request, email: string, password: string): Promise<any> {
    const role = (req.body as any).role;
    let user = await this.authService.validateUser(email, password, role);
    if (!user) {
      throw new UnauthorizedException('you are not authorized');
    }
    return user;
  }
}
