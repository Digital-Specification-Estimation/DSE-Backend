import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserSettingsService } from './services/user-settings.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './controllers/users.controller';
import { UserSettingsController } from './controllers/user-settings.controller';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    UsersService, 
    UserSettingsService,
    UserEntity, 
    PrismaService
  ],
  exports: [
    UsersService,
    UserSettingsService
  ],
  imports: [PrismaModule, JwtModule],
  controllers: [UsersController, UserSettingsController],
})
export class UsersModule {}
