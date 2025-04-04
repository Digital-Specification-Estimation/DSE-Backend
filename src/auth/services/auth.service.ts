import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { PasswordService } from './password.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
interface UserInt {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

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
      user,
      // access_token: this.jwtService.sign(payload),
    };
  }

  async signup(createUserDto: CreateUserDto) {
    try {
      // Hash password if it exists
      if (createUserDto.password) {
        createUserDto.password = await this.passwordService.hashPassword(
          createUserDto.password,
        );
      }

      // Attempt to create the user
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Email is already registered. Please use a different email.',
          );
        }
      }

      console.error('Signup Error:', error);
      throw new InternalServerErrorException(
        'An error occurred while return user;creating the user.',
      );
    }
  }
  async validateGoogleUser(profile: any) {
    let user = await this.userService.findByGoogleId(profile.providerId);
    if (!user) {
      const newUser: UpdateUserDto = {
        username: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        image_url: profile.picture,
        google_id: profile.providerId,
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
