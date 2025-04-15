import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Get('/companies')
  async getCompanies() {
    return await this.companyService.getCompanies();
  }
  @Post('add')
  async addCompanies(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyService.addCompany(createCompanyDto);
  }
  @Put('edit')
  async editCompany(@Body() updateCompanyDto: UpdateCompanyDto) {
    return await this.companyService.editCompany(updateCompanyDto);
  }
  @Delete('delete/:id')
  async deleteCompany(@Param('id') id: string) {
    return await this.companyService.deleteCompany(id);
  }
}
