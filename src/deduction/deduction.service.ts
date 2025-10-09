import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeductionDto } from './dto/create-deduction.dto';
import { UpdateDeductionDto } from './dto/update-deduction.dto';

@Injectable()
export class DeductionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeductionDto: CreateDeductionDto) {
    // Ensure company_id is provided
    if (!createDeductionDto.company_id) {
      throw new Error('company_id is required');
    }

    const deduction = await this.prisma.deduction.create({
      data: {
        name: createDeductionDto.name,
        amount: createDeductionDto.amount,
        type: createDeductionDto.type,
        reason: createDeductionDto.reason,
        date: createDeductionDto.date ? new Date(createDeductionDto.date) : null,
        employee_id: createDeductionDto.employee_id,
        company_id: createDeductionDto.company_id, // Now guaranteed to be string
      },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...deduction,
      amount: Number(deduction.amount),
    };
  }

  async findAll(companyId: string) {
    const deductions = await this.prisma.deduction.findMany({
      where: { company_id: companyId },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            trade_position: {
              select: {
                trade_name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return deductions.map(deduction => ({
      ...deduction,
      amount: Number(deduction.amount),
    }));
  }

  async findByEmployee(employeeId: string) {
    const deductions = await this.prisma.deduction.findMany({
      where: { employee_id: employeeId },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            trade_position: {
              select: {
                trade_name: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return deductions.map(deduction => ({
      ...deduction,
      amount: Number(deduction.amount),
    }));
  }

  async findOne(id: string) {
    const deduction = await this.prisma.deduction.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            trade_position: {
              select: {
                trade_name: true,
              },
            },
          },
        },
      },
    });

    if (!deduction) {
      throw new NotFoundException(`Deduction with ID ${id} not found`);
    }

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...deduction,
      amount: Number(deduction.amount),
    };
  }

  async update(id: string, updateDeductionDto: UpdateDeductionDto) {
    const existingDeduction = await this.prisma.deduction.findUnique({
      where: { id },
    });

    if (!existingDeduction) {
      throw new NotFoundException(`Deduction with ID ${id} not found`);
    }

    const deduction = await this.prisma.deduction.update({
      where: { id },
      data: {
        ...updateDeductionDto,
        date: updateDeductionDto.date ? new Date(updateDeductionDto.date) : undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            username: true,
            trade_position: {
              select: {
                trade_name: true,
              },
            },
          },
        },
      },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...deduction,
      amount: Number(deduction.amount),
    };
  }

  async remove(id: string) {
    const existingDeduction = await this.prisma.deduction.findUnique({
      where: { id },
    });

    if (!existingDeduction) {
      throw new NotFoundException(`Deduction with ID ${id} not found`);
    }

    const deduction = await this.prisma.deduction.delete({
      where: { id },
    });

    // Convert Decimal amounts to numbers for proper JSON serialization
    return {
      ...deduction,
      amount: Number(deduction.amount),
    };
  }

  async getTotalDeductionsByEmployee(employeeId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const where: any = { employee_id: employeeId };

    if (startDate && endDate) {
      where.OR = [
        { date: null }, // Include deductions without specific dates
        {
          date: {
            gte: startDate,
            lte: endDate,
          }
        }
      ];
    }

    const result = await this.prisma.deduction.aggregate({
      where,
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }

  async getTotalDeductionsByCompany(companyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const where: any = { company_id: companyId };

    if (startDate && endDate) {
      where.OR = [
        { date: null }, // Include deductions without specific dates
        {
          date: {
            gte: startDate,
            lte: endDate,
          }
        }
      ];
    }

    const result = await this.prisma.deduction.aggregate({
      where,
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  }
}
