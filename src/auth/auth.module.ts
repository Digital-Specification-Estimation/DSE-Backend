import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { UsersService } from 'src/users/services/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { CustomStrategy } from './strategies/custom.strategy';
import { PasswordService } from './services/password.service';
import { SessionSerializer } from './utils/Session.serializer';
import { PasswordResetService } from './services/password-reset.service';
import { MailModule } from 'src/mail/mail.module';
import { PrismaService } from 'nestjs-prisma';

dotenv.config();

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PrismaModule, // This provides PrismaService
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      // signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  providers: [
    AuthService,
    UsersService,
    CreateUserDto,
    UserEntity,
    LocalStrategy,
    GoogleStrategy,
    CustomStrategy,
    PrismaService,
    PasswordService,
    JwtStrategy,
    SessionSerializer,
    PasswordResetService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
