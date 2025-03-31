import { Module } from '@nestjs/common';
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
import { PasswordService } from './services/password.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionSerializer } from './utils/Session.serializer';
dotenv.config();
@Module({
  providers: [
    AuthService,
    UsersService,
    CreateUserDto,
    UserEntity,
    LocalStrategy,
    GoogleStrategy,
    PasswordService,
    PrismaService,
    JwtStrategy,
    SessionSerializer,
  ],
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule.register({ session: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET as string,
      // signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
