import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private passwordService: PasswordService,
  ) {}
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    let isMatch;
    if (user?.password) {
      isMatch = await this.passwordService.comparePasswords(
        password,
        user?.password,
      );
    }
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  signup(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    let hashedPassword;
    if (password) {
      hashedPassword = this.passwordService.hashPassword(password);
      createUserDto.password = hashedPassword;
    }
    return this.prisma.user.create({ data: createUserDto });
  }
  async validateGoogleUser(profile: any) {
    let user = await this.userService.findByGoogleId(profile.providerId);

    if (!user) {
      const newUser: CreateUserDto = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.picture,
        email: profile.email,
        googleId: profile.providerId,
      };
      user = await this.userService.createUser(newUser);
      return user;
      // }
    }
    if (user) {
      const payload = { userId: user.id, email: user.email };
      return {
        user,
        accessToken: this.jwtService.sign(payload),
      };
    } else {
      return null;
    }
  }
}
