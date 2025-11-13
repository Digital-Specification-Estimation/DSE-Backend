import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: any, done: (err: Error | null, id?: any) => void): void {
    try {
      if (!user) {
        return done(new Error('No user object provided'));
      }

      // Handle case where user might be a Mongoose document or have a _id
      const userId = user.id || user._id || user.userId || user.user.id;

      if (!userId) {
        console.error('Cannot serialize user - no ID found:', user);
        return done(new Error('User object has no ID'));
      }

      console.log('Serializing user with ID:', userId);
      done(null, userId);
    } catch (error) {
      console.error('Error in serializeUser:', error);
      done(error as Error);
    }
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
