import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PrismaModule } from 'nestjs-prisma';
import { GoogleStrategy } from './strategies/google.strategy';
import { MailModule } from '../mail/mail.module';
import { SessionSerializer } from './utils/Session.serializer';
import { PasswordResetService } from './services/password-reset.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    GoogleStrategy,
    SessionSerializer,
    PasswordResetService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
