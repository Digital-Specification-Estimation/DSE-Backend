import { Injectable, NotFoundException, Request } from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TradePosition } from '@prisma/client';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';
@Injectable()
export class TradePositionService {
  constructor(
    private prisma: PrismaService,
    private notificationGateWay: NotificationsGateway,
  ) {}
  async addTrade(createTrade: CreateTradePositionDto, userId: string) {
    try {
      const newTrade = await this.prisma.tradePosition.create({
        data: { ...createTrade },
      });
      if (newTrade) {
        await this.notificationGateWay.sendBroadcastNotification(
          userId,
          `new trade called ${newTrade.trade_name} created`,
        );
      }
      return newTrade;
    } catch (error) {
      console.log(error);
    }
  }

  async unassignProject(id: string) {
    const existing = await this.prisma.tradePosition.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('TradePosition not found');
    }

    const unassignedProject = await this.prisma.tradePosition.update({
      where: { id },
      data: {
        projectId: null,
      },
    });
    if (unassignedProject) {
      await this.notificationGateWay.BroadCastMessage(
        `${unassignedProject.trade_name} removed from a project`,
      );
    }
    return unassignedProject;
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
      const deletedTrade = await this.prisma.tradePosition.delete({
        where: { id },
      });
      if (deletedTrade) {
        await this.notificationGateWay.BroadCastMessage(
          `new trade called ${deletedTrade.trade_name} deleted`,
        );
        console.log('message of delete sent');
      }
      return deletedTrade;
    } else {
      throw new NotFoundException('the trade not found');
    }
  }
  async getTrades() {
    const trades = await this.prisma.tradePosition.findMany({
      include: {
        project: true,
        employees: { include: { trade_position: true } },
      },
    });

    return trades;
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
  async getTradesByLocationName(locationName: string) {
    const trades = await this.prisma.tradePosition.findMany({
      where: { location_name: { equals: locationName, mode: 'insensitive' } },
      include: { employees: true },
    });
    return trades.map((trade: TradePosition) => ({
      ...trade,
      daily_planned_cost: trade.daily_planned_cost?.toString(),
    }));
  }
}
