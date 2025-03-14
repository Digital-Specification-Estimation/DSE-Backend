import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UsersService, UserEntity, PrismaService],
  exports: [UsersService],
  imports: [PrismaModule, JwtModule],
  controllers: [UsersController],
})
export class UsersModule {}
