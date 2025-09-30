import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User, RoleRequestStatus } from '@prisma/client';
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
  
    const user = await this.userService.findOne(email, role,);
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
    console.log("user approval",user.role_request_approval , "user id",user.id,"password ", isMatch)
    if (user && isMatch) {
      await this.prisma.user.update({
        where: { id: user.id},
        data: { current_role: role },
      });
      const { password, ...result } = user;
console.log("result ",result)
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

  async signup(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, role, company_id } = createUserDto;
      if (!email) throw new BadRequestException('Email is required.');
      if (!password) throw new BadRequestException('Password is required.');
      if (!role) throw new BadRequestException('Role is required.');
      if (!company_id) throw new BadRequestException('Company ID is required.');
      if (Array.isArray(role)) {
        throw new BadRequestException(
          'Only one role can be assigned at a time.',
        );
      }

      const existingUser = await this.prisma.user.findFirst({
        where: { email },
        include: { settings: true },
      });

      if (existingUser) {
        const passwordMatches = await this.passwordService.comparePasswords(
          password,
          existingUser.password || '',
        );

        if (passwordMatches) {
          const hasRole =
            Array.isArray(existingUser.role) &&
            existingUser.role.includes(role);
          if (hasRole) {
            throw new ConflictException('User already exists with this role.');
          }

          // Add new role to existing user
          const updatedRoles = [...existingUser.role, role];

          const settingToConnect = await this.prisma.userSettings.findFirst({
            where: { company_id:company_id, role:role },
          });

          if (!settingToConnect) {
            throw new InternalServerErrorException(
              'User setting not found for the role.',
            );
          }

          const updatedUser = await this.prisma.user.update({
            where: { email },
            data: {
              role: updatedRoles,
              settings: {
                connect: { id: settingToConnect.id },
              },
            },
            include: { settings: true },
          });

          return updatedUser;
        }
      }

      // If user doesn't exist or password didn't match, hash password
      const hashedPassword = await this.passwordService.hashPassword(password);
console.log("company id",company_id)
      const userSetting = await this.prisma.userSettings.findFirst({
        where: { company_id:company_id, role:role },
      });

      if (!userSetting) {
        throw new InternalServerErrorException(
          'User setting not found for the company.',
        );
      }
      let newUser;
      if (role === 'admin') {
        newUser = await this.prisma.user.create({
          data: {
            ...createUserDto,
            password: hashedPassword,
            role_request_approval: RoleRequestStatus.APPROVED,
            role: Array.isArray(role) ? role : [role],
            companies: { connect: { id: company_id } },
            settings: {
              connect: { id: userSetting.id },
            },
          },
          include: { settings: true },
        });
      }
      else {
      
        newUser = await this.prisma.user.create({
          data: {
            ...createUserDto,
            password: hashedPassword,
            role_request_approval: RoleRequestStatus.PENDING,
            role: Array.isArray(role) ? role : [role],
            companies: { connect: { id: company_id } },
            settings: {
              connect: { id: userSetting.id },
            },
          },
          include: { settings: true },
        });
      }
      return newUser;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Email is already registered. Please use a different email.',
        );
      }

      if (error instanceof ConflictException) {
        throw error;
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
