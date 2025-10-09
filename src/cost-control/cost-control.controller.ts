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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CostControlService } from './cost-control.service';
import { CreateBOQItemDto } from './dto/create-boq-item.dto';
import { CreateProjectExpenseDto } from './dto/create-project-expense.dto';
import { CreateProjectRevenueDto } from './dto/create-project-revenue.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import * as csv from 'csv-parser';

@Controller('cost-control')
@UseGuards(AuthenticatedGuard)
export class CostControlController {
  constructor(private readonly costControlService: CostControlService) {}

  // BOQ Management Endpoints
  @Post('boq-items')
  async createBOQItem(@Body() createBOQItemDto: CreateBOQItemDto, @Request() req: any) {
    const boqItemData = {
      ...createBOQItemDto,
      company_id: req.user.company_id,
    };
    
    return await this.costControlService.createBOQItem(boqItemData);
  }

  @Get('boq-items/project/:projectId')
  async getBOQItemsByProject(@Param('projectId') projectId: string) {
    return await this.costControlService.getBOQItemsByProject(projectId);
  }

  @Patch('boq-items/:id')
  async updateBOQItem(@Param('id') id: string, @Body() updateData: Partial<CreateBOQItemDto>) {
    return await this.costControlService.updateBOQItem(id, updateData);
  }

  @Delete('boq-items/:id')
  async deleteBOQItem(@Param('id') id: string) {
    return await this.costControlService.deleteBOQItem(id);
  }

  @Post('boq-items/bulk/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadBOQItems(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      const results: any[] = [];
      const csvString = file.buffer.toString('utf-8');
      
      return new Promise((resolve, reject) => {
        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(csvString);
        readable.push(null);

        readable
          .pipe(csv())
          .on('data', (data: any) => results.push(data))
          .on('end', async () => {
            try {
              const boqItems = results.map(row => ({
                item_no: row.item_no,
                description: row.description,
                unit: row.unit,
                quantity: parseFloat(row.quantity) || 0,
                rate: parseFloat(row.rate) || 0,
                amount: parseFloat(row.amount) || 0,
                completed_qty: parseFloat(row.completed_qty) || 0,
                project_id: projectId,
                company_id: req.user.company_id,
              }));

              const uploadResult = await this.costControlService.bulkCreateBOQItems(projectId, boqItems);
              resolve(uploadResult);
            } catch (error) {
              reject(new BadRequestException(error.message || 'Failed to process CSV'));
            }
          })
          .on('error', (error: any) => {
            reject(new BadRequestException('Failed to parse CSV file'));
          });
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to process bulk upload');
    }
  }

  // Expense Management Endpoints
  @Post('expenses')
  async createProjectExpense(@Body() createProjectExpenseDto: CreateProjectExpenseDto, @Request() req: any) {
    const expenseData = {
      ...createProjectExpenseDto,
      company_id: req.user.company_id,
    };
    
    return await this.costControlService.createProjectExpense(expenseData);
  }

  @Get('expenses/project/:projectId')
  async getProjectExpensesByProject(@Param('projectId') projectId: string) {
    return await this.costControlService.getProjectExpensesByProject(projectId);
  }

  @Patch('expenses/:id')
  async updateProjectExpense(@Param('id') id: string, @Body() updateData: Partial<CreateProjectExpenseDto>) {
    return await this.costControlService.updateProjectExpense(id, updateData);
  }

  @Delete('expenses/:id')
  async deleteProjectExpense(@Param('id') id: string) {
    return await this.costControlService.deleteProjectExpense(id);
  }

  @Post('expenses/bulk/:projectId')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadProjectExpenses(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      const results: any[] = [];
      const csvString = file.buffer.toString('utf-8');
      
      return new Promise((resolve, reject) => {
        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(csvString);
        readable.push(null);

        readable
          .pipe(csv())
          .on('data', (data: any) => results.push(data))
          .on('end', async () => {
            try {
              const expenses = results.map(row => ({
                date: row.date || new Date().toISOString(),
                category: row.category,
                description: row.description,
                quantity: parseFloat(row.quantity) || 0,
                unit: row.unit,
                unit_price: parseFloat(row.unit_price) || 0,
                amount: parseFloat(row.amount) || 0,
                project_id: projectId,
                company_id: req.user.company_id,
              }));

              const uploadResult = await this.costControlService.bulkCreateProjectExpenses(projectId, expenses);
              resolve(uploadResult);
            } catch (error) {
              reject(new BadRequestException(error.message || 'Failed to process CSV'));
            }
          })
          .on('error', (error: any) => {
            reject(new BadRequestException('Failed to parse CSV file'));
          });
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to process bulk upload');
    }
  }

  // Revenue Management Endpoints
  @Post('revenues')
  async createProjectRevenue(@Body() createProjectRevenueDto: CreateProjectRevenueDto, @Request() req: any) {
    const revenueData = {
      ...createProjectRevenueDto,
      company_id: req.user.company_id,
    };
    
    return await this.costControlService.createProjectRevenue(revenueData);
  }

  @Get('revenues/project/:projectId')
  async getProjectRevenuesByProject(@Param('projectId') projectId: string) {
    return await this.costControlService.getProjectRevenuesByProject(projectId);
  }

  @Delete('revenues/:id')
  async deleteProjectRevenue(@Param('id') id: string) {
    return await this.costControlService.deleteProjectRevenue(id);
  }

  // Dashboard Summary Endpoint
  @Get('summary/:projectId')
  async getProjectSummary(@Param('projectId') projectId: string) {
    return await this.costControlService.getProjectSummary(projectId);
  }
}
