import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class PasswordResetToken {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
  @Exclude()
  user: User;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<PasswordResetToken>) {
    Object.assign(this, partial);
  }
}
