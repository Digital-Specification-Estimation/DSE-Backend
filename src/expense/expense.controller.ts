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
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('expenses')
@UseGuards(AuthenticatedGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    // Ensure the expense is created for the user's company
    const expenseData = {
      ...createExpenseDto,
      company_id: req.user.company_id,
    };
    
    return await this.expenseService.create(expenseData);
  }

  @Get()
  async findAll(@Request() req: any) {
    return await this.expenseService.findAll(req.user.company_id);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return await this.expenseService.findByProject(projectId);
  }

  @Get('total/project/:projectId')
  async getTotalByProject(@Param('projectId') projectId: string) {
    const total = await this.expenseService.getTotalExpensesByProject(projectId);
    return { total };
  }

  @Get('total/company')
  async getTotalByCompany(@Request() req: any) {
    const total = await this.expenseService.getTotalExpensesByCompany(req.user.company_id);
    return { total };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.expenseService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return await this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.expenseService.remove(id);
  }
}
