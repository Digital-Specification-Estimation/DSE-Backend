import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompanyEntity } from '../entities/company.entity';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
import { Express } from 'express';
import * as multer from 'multer';
import { UserSettingsService } from 'src/users/services/user-settings.service';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prismaService: PrismaService,
    private notificationGateway: NotificationsGateway,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  async getCompanies() {
    return await this.prismaService.company.findMany();
  }

  async addCompany(createCompanyDto: CreateCompanyDto) {
    try {
      // Create the company
      const company = await this.prismaService.$transaction(async (prisma) => {
        const newCompany = await prisma.company.create({
          data: createCompanyDto,
        });
        
        // Create default user settings for the company
        await this.userSettingsService.createDefaultSettingsForCompany(newCompany.id);
        
        return newCompany;
      });
      
      // if (company) {
      //   await this.notificationGateway.sendBroadcastNotification(
      //     userId,
      //     `Company called ${company.company_name} is created`,
      //   );
      // }
      
      return company;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async getCompanyById(id: string) {
    const company: CompanyEntity | null =
      await this.prismaService.company.findUnique({
        where: { id },
      });
    return { ...company, overtime_rate: company?.overtime_rate.toString() };
  }

  async editCompany(
    updateCompanyDto: UpdateCompanyDto,
    image: Express.Multer.File,
  ) {
    if (image) {
      return await this.prismaService.company.update({
        where: { id: updateCompanyDto.id },
        data: {
          ...updateCompanyDto,
          company_profile: image.path,
        },
      });
    } else {
      return await this.prismaService.company.update({
        where: { id: updateCompanyDto.id },
        data: {
          ...updateCompanyDto,
        },
      });
    }
  }

  async deleteCompany(id: string, userId: string) {
    const company = await this.prismaService.company.delete({ where: { id } });
    if (company) {
      await this.notificationGateway.sendBroadcastNotification(
        userId,
        `Company called ${company.company_name} is deleted`,
      );
    }
    return company;
  }
}
