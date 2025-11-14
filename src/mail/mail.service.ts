import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM_EMAIL'),
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Generates a random verification code
   * @param length - Length of the verification code (default: 6)
   * @returns A numeric verification code as a string
   */
  generateVerificationCode(length: number = 6): string {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    const code = parseInt(buffer.toString('hex'), 16)
      .toString()
      .substring(0, length);
    // Pad with leading zeros if needed
    return code.padStart(length, '0');
  }

  /**
   * Sends an email with a verification code
   * @param email - Recipient's email address
   * @param code - Verification code to send
   * @returns Promise that resolves when the email is sent
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM_EMAIL'),
      to: email,
      subject: 'Email Verification Code',
      html: `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 2.5em; letter-spacing: 0.2em; margin: 20px 0;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
