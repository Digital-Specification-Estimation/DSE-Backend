import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { DeductionService } from './deduction.service';
import { CreateDeductionDto } from './dto/create-deduction.dto';
import { UpdateDeductionDto } from './dto/update-deduction.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('deductions')
@UseGuards(AuthenticatedGuard)
export class DeductionController {
  constructor(private readonly deductionService: DeductionService) {}

  @Post()
  async create(@Body() createDeductionDto: CreateDeductionDto, @Request() req: any) {
    try {
      console.log('Received deduction data:', createDeductionDto);
      console.log('User from session:', req.user);
      
      if (!req.user?.company_id) {
        throw new Error('User company_id is required');
      }
      
      // Ensure the deduction is created for the user's company
      const deductionData = {
        ...createDeductionDto,
        company_id: req.user.company_id,
      };
      
      console.log('Final deduction data:', deductionData);
      const result = await this.deductionService.create(deductionData);
      console.log('Created deduction:', result);
      return result;
    } catch (error) {
      console.error('Error creating deduction:', error);
      throw error;
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    return await this.deductionService.findAll(req.user.company_id);
  }

  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return await this.deductionService.findByEmployee(employeeId);
  }

  @Get('total/employee/:employeeId')
  async getTotalByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    const total = await this.deductionService.getTotalDeductionsByEmployee(employeeId, start, end);
    return { total };
  }

  @Get('total/company')
  async getTotalByCompany(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    const total = await this.deductionService.getTotalDeductionsByCompany(req.user.company_id, start, end);
    return { total };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.deductionService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDeductionDto: UpdateDeductionDto) {
    return await this.deductionService.update(id, updateDeductionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.deductionService.remove(id);
  }
}
