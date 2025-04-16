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
import { connect } from 'http2';
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
  async validateUser(
    email: string,
    password: string,
    role: string,
  ): Promise<any> {
    const user = await this.userService.findOne(email, role);
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

  async signup(createUserDto: CreateUserDto | any) {
    try {
      // Hash the password if it exists

      const user = await this.prisma.user.findFirst({
        where: { email: createUserDto.email },
      });
      const isMatch = await this.passwordService.comparePasswords(
        createUserDto.password,
        user?.password ? user?.password : '',
      );
      // If user exists
      if (user && isMatch) {
        // Check if the role already exists
        const hasRole = user.role.includes(createUserDto.role);
        if (hasRole) {
          throw new ConflictException('User already exists with this role.');
        }

        // Add the new role
        const updatedUser = await this.prisma.user.update({
          where: { email: createUserDto.email },
          data: { role: [...user.role, createUserDto.role] },
        });

        return updatedUser;
      }
      if (createUserDto.password) {
        createUserDto.password = await this.passwordService.hashPassword(
          createUserDto.password,
        );
      }
      // Else, create the user
      return await this.prisma.user.create({
        data: {
          ...createUserDto,
          role: Array.isArray(createUserDto.role)
            ? createUserDto.role
            : [createUserDto.role],
          companies: { connect: { id: createUserDto.company_id } },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Email is already registered. Please use a different email.',
          );
        }
      }
      if (error.message == 'User already exists with this role.') {
        throw new ConflictException('User already exists with this role.');
      }
      console.error('Signup Error:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating the user.',
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
