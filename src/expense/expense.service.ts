import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        ...createExpenseDto,
        date: createExpenseDto.date ? new Date(createExpenseDto.date) : new Date(),
      },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async findAll(companyId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { company_id: companyId },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            location_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return expenses.map(expense => ({
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    }));
  }

  async findByProject(projectId: string) {
    const expenses = await this.prisma.expense.findMany({
      where: { project_id: projectId },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            location_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return expenses.map(expense => ({
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    }));
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            location_name: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        ...updateExpenseDto,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            location_name: true,
          },
        },
      },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async remove(id: string) {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }

    const expense = await this.prisma.expense.delete({
      where: { id },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async getTotalExpensesByProject(projectId: string): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: { project_id: projectId },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getTotalExpensesByCompany(companyId: string): Promise<number> {
    const result = await this.prisma.expense.aggregate({
      where: { company_id: companyId },
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }
}
