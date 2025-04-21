import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { CreateTradePositionDto } from '../dto/create-trade-position.dto';
import { UpdateTradePositionDto } from '../dto/update-trade-position.dto';
import { TradePositionService } from '../services/trade-position.service';

@Controller('trade-position')
export class TradePositionController {
  constructor(private readonly tradePositionService: TradePositionService) {}
  @Post('add')
  async addTrade(
    @Body() createTrade: CreateTradePositionDto,
    @Request() req: any,
  ) {
    console.log(req.user);
    return await this.tradePositionService.addTrade(createTrade, req.user.id);
  }
  @Get('get/:id')
  async getTrade(@Param('id') id: string) {
    return await this.tradePositionService.getTrade(id);
  }
  async getDaysBetween(pastDate: Date) {
    const now = new Date();
    const timeDifference = now.getTime() - pastDate.getTime();
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  }
  @Get('trades')
  async getTrades() {
    try {
      const trades = await this.tradePositionService.getTrades();

      const results = await Promise.all(
        trades.map(async (trade: any) => {
          let actual_cost = 0;
          let planned_costs = 0;
          // Safely handle employees and calculate cost
          const employeeCosts = await Promise.all(
            trade.employees.map(async (employee: any) => {
              const dailyRate = Number(employee.daily_rate ?? 0);

              const createdDate = employee.created_date
                ? new Date(employee.created_date)
                : new Date();

              const days = await this.getDaysBetween(createdDate);
              const cost = dailyRate * days;

              return cost;
            }),
          );
          const plannedemployeeCosts = await Promise.all(
            trade.employees.map(async (employee: any) => {
              const planned_daily_rate = Number(
                employee.trade_position?.daily_planned_cost,
              );
              const createdDate = employee.created_date
                ? new Date(employee.created_date)
                : new Date();

              const days = await this.getDaysBetween(createdDate);
              const planned_cost = planned_daily_rate * days;

              return planned_cost;
            }),
          );
          actual_cost = employeeCosts.reduce((sum, val) => sum + val, 0);
          planned_costs = plannedemployeeCosts.reduce(
            (sum, val) => sum + val,
            0,
          );
          return {
            ...trade,
            actual_cost,
            planned_costs,
            difference: (planned_costs - actual_cost).toFixed(2),
            daily_planned_cost: trade.daily_planned_cost?.toString(),
          };
        }),
      );

      return results;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  }

  @Delete('delete/:id')
  async deleteTrade(@Param('id') id: string, @Request() req: any) {
    return await this.tradePositionService.deleteTrade(id, req.user.id);
  }
  @Put('edit')
  async editTrade(@Body() updateTrade: UpdateTradePositionDto) {
    return await this.tradePositionService.editTrade(updateTrade);
  }
  @Get('number')
  async getNumber() {
    return await this.tradePositionService.getTradesNumber();
  }
  @Get('trades-location-name/:location_name')
  async getTradesBylocationName(@Param('location_name') locationName: string) {
    return await this.tradePositionService.getTradesByLocationName(
      locationName,
    );
  }
  @Patch('unassign-project/:id')
  async unassignProject(@Param('id') id: string, @Request() req: any) {
    return this.tradePositionService.unassignProject(id, req.user.id);
  }
}
