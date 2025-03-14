import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
  async findByGoogleId(googleId: string): Promise<User | null> {
    if (googleId == null) {
      return null;
    }
    return this.prisma.user.findFirst({ where: { google_id: googleId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.prisma.user.create({
      data: { ...userData },
    });
    return user;
  }

  async updateProfile(updateUserDto: UpdateUserDto, id: string) {
    const userToUpdate = await this.findById(id);
    if (userToUpdate) {
      return this.prisma.user.update({ where: { id }, data: updateUserDto });
    } else {
      return { message: 'user not found' };
    }
  }
  async updateProfilePicture(imagePath: string | null, id: string) {
    const userToUpdate = await this.findById(id);
    if (userToUpdate) {
      return this.prisma.user.update({
        where: { id },
        data: { image_url: imagePath },
      });
    } else {
      return { message: 'user not found' };
    }
  }
  async deleteUser(id: string) {
    const userToDelete = await this.findById(id);
    if (userToDelete) {
      return this.prisma.user.delete({ where: { id } });
    } else {
      throw new NotFoundException('user not found');
    }
  }
}
