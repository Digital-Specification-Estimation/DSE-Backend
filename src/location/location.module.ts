import { Module } from '@nestjs/common';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [LocationController],
  providers: [LocationService, PrismaService],
  imports: [PrismaModule],
})
export class LocationModule {}
