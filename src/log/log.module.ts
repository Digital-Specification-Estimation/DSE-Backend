import { Module } from '@nestjs/common';
import { LogService } from './services/log.service';
import { LogController } from './controllers/log.controller';

@Module({
  controllers: [LogController],
  providers: [LogService],
})
export class LogModule {}
