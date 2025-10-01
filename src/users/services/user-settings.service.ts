import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserSettingsDto } from '../dto/create-user-settings.dto';
import { UpdateUserSettingsDto } from '../dto/update-user-settings.dto';
import { UserSettingsEntity } from '../entities/user-settings.entity';

@Injectable()
export class UserSettingsService {
  constructor(private prisma: PrismaService) {}

  private readonly rolePermissions = {
    admin: {
      full_access: true,
      approve_attendance: true,
      manage_payroll: true,
      view_reports: true,
      approve_leaves: true,
      view_payslip: true,
      mark_attendance: true,
      manage_employees: true,
      generate_reports: true,
    },
      
    hr_manager: {
      full_access: false,
      approve_attendance: true,
      manage_payroll: true,
      view_reports: true,
      approve_leaves: true,
      view_payslip: true,
      mark_attendance: true,
      manage_employees: true,
      generate_reports: true,
    },
    departure_manager: {
      full_access: false,
      approve_attendance: true,
      manage_payroll: false,
      view_reports: true,
      approve_leaves: true,
      view_payslip: false,
      mark_attendance: true,
      manage_employees: false,
      generate_reports: false,
    },
    employee: {
      full_access: false,
      approve_attendance: false,
      manage_payroll: false,
      view_reports: false,
      approve_leaves: false,
      view_payslip: true,
      mark_attendance: true,
      manage_employees: false,
      generate_reports: false,
    },
  };

  async createDefaultSettingsForCompany(companyId: string, tx?: any): Promise<void> {
    // Use the transaction client if provided, otherwise use the default prisma client
    const prisma = tx || this.prisma;
    
    // Create settings for each role
    const roles = Object.keys(this.rolePermissions) as Array<keyof typeof this.rolePermissions>;
    
    for (const role of roles) {
        await prisma.userSettings.create({
            data: {
              role,
              company_id: companyId,
              ...this.rolePermissions[role],  // This might contain a 'company' property
            },
          });
    }
  }

  async getSettingsForRole(role: string, companyId: string): Promise<UserSettingsEntity | null> {
    const settings = await this.prisma.userSettings.findFirst({
        where: { 
            role,
            company_id: companyId  // or just use object property shorthand: { role, companyId }
          },
    });
    
    return settings ? new UserSettingsEntity(settings) : null;
  }

  async createUserSettings(createUserSettingsDto: CreateUserSettingsDto): Promise<UserSettingsEntity> {
    const settings = await this.prisma.userSettings.create({
      data: {
        ...createUserSettingsDto,
        company_id: createUserSettingsDto.companyId,
      },
    });
    
    return new UserSettingsEntity(settings);
  }

  async getUserSettingsByCompany(companyId: string): Promise<UserSettingsEntity[]> {
    const settings = await this.prisma.userSettings.findMany({
      where: { company_id: companyId },
    });
    
    return settings.map(s => new UserSettingsEntity(s));
  }

  async updateUserSettings(
    id: string,
    updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsEntity> {
    const { companyId, ...updateData } = updateUserSettingsDto;
    const data: any = { ...updateData };
    
    if (companyId) {
      data.company_id = companyId;
    }
    
    const updatedSettings = await this.prisma.userSettings.update({
      where: { id },
      data,
    });
    
    return new UserSettingsEntity(updatedSettings);
  }
}