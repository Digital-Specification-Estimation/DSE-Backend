import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string, role: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, role: { hasSome: [role] } },
      include: { companies: true, settings: true },
    });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { companies: true, settings: true },
    });
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
  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return !!user;
  }
  async updateProfile(updateUserDto: UpdateUserDto, id: string) {
    const userToUpdate = await this.findById(id);
    if (userToUpdate) {
      const update = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      console.log('user update', update);
      return update;
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
  async updatePrevieleges(roleAndPrevileges: RolePrevielegeInt[]) {
    const allPermissions = [
      'Full access',
      'Approve attendance',
      'Manage payroll',
      'View reports',
      'Approve leaves',
      'View payslips',
      'Mark attendance',
      'Manage employees',
      'Generate reports',
    ];

    for (const roleAndPrevilege of roleAndPrevileges) {
      const settingToUpdate = await this.prisma.userSettings.findFirst({
        where: { role: { equals: roleAndPrevilege.role, mode: 'insensitive' } },
      });

      if (!settingToUpdate) {
        throw new Error('setting to update is not available');
      }

      const updateData: Record<string, boolean> = {};

      for (const permission of allPermissions) {
        switch (permission) {
          case 'Full access':
            updateData.full_access =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Approve attendance':
            updateData.approve_attendance =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Manage payroll':
            updateData.manage_payroll =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'View reports':
            updateData.view_reports =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Approve leaves':
            updateData.approve_leaves =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'View payslips':
            updateData.view_payslip =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Mark attendance':
            updateData.mark_attendance =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Manage employees':
            updateData.manage_employees =
              roleAndPrevilege.permissions.includes(permission);
            break;
          case 'Generate reports':
            updateData.generate_reports =
              roleAndPrevilege.permissions.includes(permission);
            break;
        }
      }

      await this.prisma.userSettings.update({
        where: { id: settingToUpdate.id },
        data: updateData,
      });
    }
  }

  async singleUpdatePrevieleges(roleAndPrevilege: RolePrevielegeInt) {
    const settingToUpdate = await this.prisma.userSettings.findFirst({
      where: { role: { equals: roleAndPrevilege.role, mode: 'insensitive' } },
    });
    if (!settingToUpdate) {
      throw new Error('setting to update is not available');
    }
    roleAndPrevilege.permissions.map(async (previelege: string) => {
      switch (previelege) {
        case 'Full access':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { full_access: true },
          });
          break;
        case 'Approve attendance':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { approve_attendance: true },
          });
          break;
        case 'Manage payroll':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { manage_payroll: true },
          });
          break;
        case 'View reports':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { view_reports: true },
          });

          break;
        case 'Approve leaves':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { approve_leaves: true },
          });

          break;
        case 'View payslips':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { view_payslip: true },
          });

          break;
        case 'Mark attendance':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { mark_attendance: true },
          });

          break;
        case 'Manage employees':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { manage_employees: true },
          });

          break;
        case 'Generate reports':
          await this.prisma.userSettings.update({
            where: { id: settingToUpdate.id },
            data: { generate_reports: true },
          });

          break;
      }
    });
    return 'updating previeleges completed';
  }
  async getPrevieleges() {
    const settings = await this.prisma.userSettings.findMany();

    return settings.map((setting) => {
      const { id, role, ...permissions } = setting;

      const truePermissions = Object.entries(permissions)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key);

      return {
        role,
        permissions: truePermissions,
      };
    });
  }
}
