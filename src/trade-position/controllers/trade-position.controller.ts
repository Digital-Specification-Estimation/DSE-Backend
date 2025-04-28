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
import { AttendanceEntity } from 'src/attendance/entities/attendance.entity';

@Controller('trade-position')
export class TradePositionController {
  constructor(private readonly tradePositionService: TradePositionService) {}
  @Post('add')
  async addTrade(
    @Body() createTrade: CreateTradePositionDto,
    @Request() req: any,
  ) {
    console.log(req.user);
    return await this.tradePositionService.addTrade(
      createTrade,
      req.user.id,
      req.user.company_id,
    );
  }
  @Get('get/:id')
  async getTrade(@Param('id') id: string) {
    return await this.tradePositionService.getTrade(id);
  }
  async getDaysBetween(pastDate: Date) {
    const now = new Date();

    // Strip time part from both dates
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfPastDay = new Date(
      pastDate.getFullYear(),
      pastDate.getMonth(),
      pastDate.getDate(),
    );

    const timeDifference = startOfToday.getTime() - startOfPastDay.getTime();
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return days + 1; // Add 1 to include today
  }

  @Get('trades')
  async getTrades(@Request() req: any) {
    try {
      if (req.user.salary_calculation === 'monthly rate') {
        const trades = await this.tradePositionService.getTrades(
          req.user.company_id,
        );

        const results = await Promise.all(
          trades.map(async (trade: any) => {
            let actual_cost = 0;
            let planned_costs = 0;

            // Safely handle employees and calculate cost
            const employeeCosts = await Promise.all(
              trade.employees.map(async (employee: any) => {
                let daysAbsentNoReason = 0;
                await employee.attendance.map((attend: AttendanceEntity) => {
                  if (
                    (attend.reason === '' || null || undefined) &&
                    attend.status === 'absent'
                  ) {
                    daysAbsentNoReason += 1;
                  }
                });
                const monthlyRate = Number(employee.monthly_rate ?? 0);

                const createdDate = employee.created_date
                  ? new Date(employee.created_date)
                  : new Date();

                const days = await this.getDaysBetween(createdDate);
                const cost = monthlyRate * ((days - daysAbsentNoReason) / 30);

                return cost;
              }),
            );
            const plannedemployeeCosts = await Promise.all(
              trade.employees.map(async (employee: any) => {
                let daysAbsentNoReason = 0;
                await employee.attendance.map((attend: AttendanceEntity) => {
                  if (
                    (attend.reason === '' || null || undefined) &&
                    attend.status === 'absent'
                  ) {
                    daysAbsentNoReason += 1;
                  }
                });
                const planned_monthly_rate = Number(
                  employee.trade_position?.monthly_planned_cost,
                );
                const createdDate = employee.created_date
                  ? new Date(employee.created_date)
                  : new Date();

                const days = await this.getDaysBetween(createdDate);
                const planned_cost =
                  planned_monthly_rate * ((days - daysAbsentNoReason) / 30);

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
              monthly_planned_cost: trade.monthly_planned_cost?.toString(),
            };
          }),
        );

        return results;
      } else {
        const trades = await this.tradePositionService.getTrades(
          req.user.company_id,
        );

        const results = await Promise.all(
          trades.map(async (trade: any) => {
            let actual_cost = 0;
            let planned_costs = 0;
            // Safely handle employees and calculate cost
            const employeeCosts = await Promise.all(
              trade.employees.map(async (employee: any) => {
                let daysAbsentNoReason = 0;
                await employee.attendance.map((attend: AttendanceEntity) => {
                  if (
                    (attend.reason === '' || null || undefined) &&
                    attend.status === 'absent'
                  ) {
                    daysAbsentNoReason += 1;
                  }
                });
                const dailyRate = Number(employee.daily_rate ?? 0);

                const createdDate = employee.created_date
                  ? new Date(employee.created_date)
                  : new Date();

                const days = await this.getDaysBetween(createdDate);
                const cost = dailyRate * (days - daysAbsentNoReason);

                return cost;
              }),
            );
            const plannedemployeeCosts = await Promise.all(
              trade.employees.map(async (employee: any) => {
                let daysAbsentNoReason = 0;
                await employee.attendance.map((attend: AttendanceEntity) => {
                  if (
                    (attend.reason === '' || null || undefined) &&
                    attend.status === 'absent'
                  ) {
                    daysAbsentNoReason += 1;
                  }
                });
                const planned_daily_rate = Number(
                  employee.trade_position?.daily_planned_cost,
                );
                const createdDate = employee.created_date
                  ? new Date(employee.created_date)
                  : new Date();

                const days = await this.getDaysBetween(createdDate);
                const planned_cost =
                  planned_daily_rate * (days - daysAbsentNoReason);

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
              monthly_planned_cost: trade.monthly_planned_cost?.toString(),
            };
          }),
        );

        return results;
      }
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
