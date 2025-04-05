import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TradePositionService {
  constructor(private prisma: PrismaService) {}
  async addTrade(createTrade: CreateTradePositionDto) {
    try {
      return await this.prisma.tradePosition.create({
        data: { ...createTrade },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async editTrade(updateTrade: UpdateTradePositionDto) {
    if (!updateTrade.id) {
      throw new NotFoundException('the trade id not found');
    }
    if (await this.tradeExists(updateTrade.id)) {
      return await this.prisma.tradePosition.update({
        where: { id: updateTrade.id },
        data: { ...updateTrade },
      });
    } else {
      throw new NotFoundException('the trade not found');
    }
  }
  async deleteTrade(id: string) {
    if (!id) {
      throw new NotFoundException('the trade id not found');
    }
    if (await this.tradeExists(id)) {
      return await this.prisma.tradePosition.delete({ where: { id } });
    } else {
      throw new NotFoundException('the trade not found');
    }
  }
  async getTrades() {
    return await this.prisma.tradePosition.findMany();
  }
  async getTradesNumber() {
    return await this.prisma.tradePosition.count();
  }
  async tradeExists(id: string): Promise<boolean> {
    const trade = await this.prisma.tradePosition.findUnique({ where: { id } });
    return !!trade;
  }
  async getTrade(id: string) {
    if (await this.tradeExists(id)) {
      return await this.prisma.tradePosition.findUnique({ where: { id } });
    } else {
      throw new NotFoundException('the trade not found');
    }
  }
}
