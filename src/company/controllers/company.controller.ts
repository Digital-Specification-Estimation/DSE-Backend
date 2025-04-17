import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Get('/companies')
  async getCompanies() {
    return await this.companyService.getCompanies();
  }

  @Post('add')
  async addCompanies(@Body() createCompanyDto: CreateCompanyDto) {
    console.log(createCompanyDto);
    return await this.companyService.addCompany(createCompanyDto);
  }
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  @Put('edit')
  async editCompany(
    @UploadedFile() image: Express.Multer.File,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.companyService.editCompany(updateCompanyDto, image);
  }
  @Delete('delete/:id')
  async deleteCompany(@Param('id') id: string) {
    return await this.companyService.deleteCompany(id);
  }
  @Get('get/:id')
  async getCompanyById(@Param('id') id: string) {
    return await this.companyService.getCompanyById(id);
  }
}
