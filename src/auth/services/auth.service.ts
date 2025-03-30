import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { PasswordService } from './password.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
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
      access_token: this.jwtService.sign(payload),
    };
  }
  async signup(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    console.log('->', password);
    let hashedPassword;
    if (password) {
      hashedPassword = await this.passwordService.hashPassword(password);
      console.log(hashedPassword);
      createUserDto.password = hashedPassword;
    }
    return await this.prisma.user.create({ data: createUserDto });
  }

  async validateGoogleUser(profile: UserInt) {
    let user = await this.userService.findByGoogleId(profile.providerId);
    console.log(user);
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
