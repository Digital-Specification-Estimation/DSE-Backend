import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBOQItemDto } from './dto/create-boq-item.dto';
import { CreateProjectExpenseDto } from './dto/create-project-expense.dto';
import { CreateProjectRevenueDto } from './dto/create-project-revenue.dto';

@Injectable()
export class CostControlService {
  constructor(private readonly prisma: PrismaService) {}

  // BOQ Item Management
  async createBOQItem(createBOQItemDto: CreateBOQItemDto) {
    const boqItem = await this.prisma.bOQItem.create({
      data: createBOQItemDto,
    });

    return {
      ...boqItem,
      quantity: Number(boqItem.quantity),
      rate: Number(boqItem.rate),
      amount: Number(boqItem.amount),
      completed_qty: Number(boqItem.completed_qty || 0),
    };
  }

  async getBOQItemsByProject(projectId: string) {
    const boqItems = await this.prisma.bOQItem.findMany({
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
      orderBy: { item_no: 'asc' },
    });

    return boqItems.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      completed_qty: Number(item.completed_qty || 0),
    }));
  }

  async updateBOQItem(id: string, updateData: Partial<CreateBOQItemDto>) {
    const existingItem = await this.prisma.bOQItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`BOQ Item with ID ${id} not found`);
    }

    const boqItem = await this.prisma.bOQItem.update({
      where: { id },
      data: updateData,
    });

    return {
      ...boqItem,
      quantity: Number(boqItem.quantity),
      rate: Number(boqItem.rate),
      amount: Number(boqItem.amount),
      completed_qty: Number(boqItem.completed_qty || 0),
    };
  }

  async deleteBOQItem(id: string) {
    const existingItem = await this.prisma.bOQItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundException(`BOQ Item with ID ${id} not found`);
    }

    return await this.prisma.bOQItem.delete({
      where: { id },
    });
  }

  // Project Expense Management
  async createProjectExpense(createProjectExpenseDto: CreateProjectExpenseDto) {
    const expense = await this.prisma.projectExpense.create({
      data: {
        ...createProjectExpenseDto,
        date: createProjectExpenseDto.date ? new Date(createProjectExpenseDto.date) : new Date(),
      },
    });

    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async getProjectExpensesByProject(projectId: string) {
    const expenses = await this.prisma.projectExpense.findMany({
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

    return expenses.map(expense => ({
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    }));
  }

  async updateProjectExpense(id: string, updateData: Partial<CreateProjectExpenseDto>) {
    const existingExpense = await this.prisma.projectExpense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Project Expense with ID ${id} not found`);
    }

    const expense = await this.prisma.projectExpense.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    return {
      ...expense,
      quantity: Number(expense.quantity),
      unit_price: Number(expense.unit_price),
      amount: Number(expense.amount),
    };
  }

  async deleteProjectExpense(id: string) {
    const existingExpense = await this.prisma.projectExpense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException(`Project Expense with ID ${id} not found`);
    }

    return await this.prisma.projectExpense.delete({
      where: { id },
    });
  }

  // Project Revenue Management
  async createProjectRevenue(createProjectRevenueDto: CreateProjectRevenueDto) {
    const revenue = await this.prisma.projectRevenue.create({
      data: {
        ...createProjectRevenueDto,
        from_date: new Date(createProjectRevenueDto.from_date),
        to_date: new Date(createProjectRevenueDto.to_date),
      },
    });

    return {
      ...revenue,
      quantity_done: Number(revenue.quantity_done),
      rate: Number(revenue.rate),
      amount: Number(revenue.amount),
    };
  }

  async getProjectRevenuesByProject(projectId: string) {
    const revenues = await this.prisma.projectRevenue.findMany({
      where: { project_id: projectId },
      include: {
        project: {
          select: {
            id: true,
            project_name: true,
            location_name: true,
          },
        },
        boq_item: {
          select: {
            id: true,
            item_no: true,
            description: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return revenues.map(revenue => ({
      ...revenue,
      quantity_done: Number(revenue.quantity_done),
      rate: Number(revenue.rate),
      amount: Number(revenue.amount),
    }));
  }

  async deleteProjectRevenue(id: string) {
    const existingRevenue = await this.prisma.projectRevenue.findUnique({
      where: { id },
    });

    if (!existingRevenue) {
      throw new NotFoundException(`Project Revenue with ID ${id} not found`);
    }

    return await this.prisma.projectRevenue.delete({
      where: { id },
    });
  }

  // Dashboard Summary
  async getProjectSummary(projectId: string) {
    // Get BOQ totals
    const boqSummary = await this.prisma.bOQItem.aggregate({
      where: { project_id: projectId },
      _sum: {
        amount: true,
        completed_qty: true,
      },
      _count: true,
    });

    // Get expense totals
    const expenseSummary = await this.prisma.projectExpense.aggregate({
      where: { project_id: projectId },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get revenue totals
    const revenueSummary = await this.prisma.projectRevenue.aggregate({
      where: { project_id: projectId },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get project budget
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { budget: true },
    });

    const totalBOQAmount = Number(boqSummary._sum.amount || 0);
    const totalExpenses = Number(expenseSummary._sum.amount || 0);
    const totalRevenues = Number(revenueSummary._sum.amount || 0);
    const projectBudget = Number(project?.budget || 0);

    // Calculate completion percentage
    const completionPercentage = totalBOQAmount > 0 ? (totalRevenues / totalBOQAmount) * 100 : 0;

    // Calculate profit/loss
    const totalCosts = totalExpenses;
    const profit = totalRevenues - totalCosts;
    const profitMargin = totalRevenues > 0 ? (profit / totalRevenues) * 100 : 0;

    return {
      boq: {
        totalAmount: totalBOQAmount,
        itemCount: boqSummary._count,
        completedValue: totalRevenues,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
      },
      expenses: {
        totalAmount: totalExpenses,
        itemCount: expenseSummary._count,
      },
      revenues: {
        totalAmount: totalRevenues,
        itemCount: revenueSummary._count,
      },
      summary: {
        projectBudget,
        totalRevenues,
        totalExpenses: totalCosts,
        profit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        budgetUtilization: projectBudget > 0 ? (totalCosts / projectBudget) * 100 : 0,
      },
    };
  }

  // Bulk upload methods (for CSV support)
  async bulkCreateBOQItems(projectId: string, boqItems: CreateBOQItemDto[]) {
    const results = {
      created: 0,
      errors: [] as string[],
    };

    for (const item of boqItems) {
      try {
        await this.createBOQItem({ ...item, project_id: projectId });
        results.created++;
      } catch (error) {
        results.errors.push(`Item ${item.item_no}: ${error.message}`);
      }
    }

    return results;
  }

  async bulkCreateProjectExpenses(projectId: string, expenses: CreateProjectExpenseDto[]) {
    const results = {
      created: 0,
      errors: [] as string[],
    };

    for (const expense of expenses) {
      try {
        await this.createProjectExpense({ ...expense, project_id: projectId });
        results.created++;
      } catch (error) {
        results.errors.push(`Expense ${expense.description}: ${error.message}`);
      }
    }

    return results;
  }
}
