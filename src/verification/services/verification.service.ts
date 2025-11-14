import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface VerificationCode {
  code: string;
  expiresAt: Date;
  verified: boolean;
}

@Injectable()
export class VerificationService {
  private verificationCodes: Map<string, VerificationCode> = new Map();
  private readonly CODE_EXPIRATION_MINUTES = 10;

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async generateAndSendCode(email: string): Promise<string> {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRATION_MINUTES);

    this.verificationCodes.set(email, {
      code,
      expiresAt,
      verified: false,
    });

    await this.mailService.sendVerificationEmail(email, code);
    return code;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const storedCode = this.verificationCodes.get(email);

    if (!storedCode || storedCode.expiresAt < new Date()) {
      return false;
    }

    if (storedCode.code !== code) {
      return false;
    }

    storedCode.verified = true;
    this.verificationCodes.set(email, storedCode);
    return true;
  }

  isVerified(email: string): boolean {
    const storedCode = this.verificationCodes.get(email);
    return storedCode?.verified || false;
  }

  removeCode(email: string): void {
    this.verificationCodes.delete(email);
  }
}
