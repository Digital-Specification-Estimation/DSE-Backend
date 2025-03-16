import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './controllers/location.controller';

@Module({
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
