import { Module } from '@nestjs/common';
import { CostControlService } from './cost-control.service';
import { CostControlController } from './cost-control.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostControlController],
  providers: [CostControlService],
  exports: [CostControlService],
})
export class CostControlModule {}
