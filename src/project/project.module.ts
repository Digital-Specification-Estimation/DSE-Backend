import { Module } from '@nestjs/common';
import { ProjectController } from './controllers/project.controller';
import { ProjectService } from './services/project.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ProjectController],
  providers: [ProjectService, PrismaService],
  imports: [PrismaModule],
})
export class ProjectModule {}
