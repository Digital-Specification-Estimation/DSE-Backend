import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}
  async getCompanies() {
    return this.prismaService.company.findMany();
  }
  async addCompany(createCompanyDto: CreateCompanyDto) {
    return await this.prismaService.company.create({ data: createCompanyDto });
  }
  async editCompany(updateCompanyDto: UpdateCompanyDto) {
    return await this.prismaService.company.update({
      where: { id: updateCompanyDto.id },
      data: updateCompanyDto,
    });
  }
  async deleteCompany(id: string) {
    return await this.prismaService.company.delete({ where: { id } });
  }
}
