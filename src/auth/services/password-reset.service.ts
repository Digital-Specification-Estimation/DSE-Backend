import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { randomBytes, createHash } from 'crypto';
import { addHours } from 'date-fns';
import { MailService } from 'src/mail/mail.service';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/forgot-password.dto';

@Injectable()
export class PasswordResetService {
  private readonly TOKEN_EXPIRATION_HOURS = 1;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createPasswordResetToken(email: string): Promise<string | null> {
    // Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // For security reasons, don't reveal if the email exists or not
      return null;
    }

    // Generate a random token
    const token = randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(token);
    
    // Set expiration time
    const expiresAt = addHours(new Date(), this.TOKEN_EXPIRATION_HOURS);

    // Save the token to the database
    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: hashedToken,
        expiresAt,
        used: false,
      },
      create: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send email with the plain token (not hashed)
    await this.mailService.sendPasswordResetEmail(email, token);
    
    return token;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const hashedToken = this.hashToken(token);
    const now = new Date();

    // Find a valid, unused token that hasn't expired
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expiresAt: { gt: now },
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Mark token as used
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Update user's password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: newPassword }, // The password will be hashed by the UserService
    });

    return true;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
