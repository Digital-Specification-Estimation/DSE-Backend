import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, id?: any) => void): void {
    console.log('Serializing user:', user);
    done(null, user.id);
  }

  async deserializeUser(
    userId: string,
    done: (err: Error | null, user?: any) => void,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return done(new Error('User not found'));
    }
    done(null, user);
  }
}
