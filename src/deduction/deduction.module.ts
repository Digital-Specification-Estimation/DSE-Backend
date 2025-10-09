import { Module } from '@nestjs/common';
import { DeductionService } from './deduction.service';
import { DeductionController } from './deduction.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeductionController],
  providers: [DeductionService],
  exports: [DeductionService],
})
export class DeductionModule {}
