import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserSettingsService } from '../services/user-settings.service';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { CreateUserSettingsDto } from '../dto/create-user-settings.dto';
import { UpdateUserSettingsDto } from '../dto/update-user-settings.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { UserRole } from 'src/users/enums/user-role.enum';

@ApiTags('User Settings')
@ApiBearerAuth()
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create user settings' })
  @ApiResponse({ status: 201, description: 'User settings created successfully.', type: UserSettingsEntity })
  async create(@Body() createUserSettingsDto: CreateUserSettingsDto): Promise<UserSettingsEntity> {
    return this.userSettingsService.createUserSettings(createUserSettingsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully.', type: UserSettingsEntity })
  @ApiResponse({ status: 404, description: 'User settings not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserSettingsDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsEntity> {
    return this.userSettingsService.updateUserSettings(id, updateUserSettingsDto);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all user settings for a company' })
  @ApiResponse({ status: 200, description: 'Return all user settings for the company.', type: [UserSettingsEntity] })
  async findByCompany(@Param('companyId') companyId: string): Promise<UserSettingsEntity[]> {
    return this.userSettingsService.getUserSettingsByCompany(companyId);
  }

  @Get('role/:role/company/:companyId')
  @ApiOperation({ summary: 'Get user settings for a specific role in a company' })
  @ApiResponse({ status: 200, description: 'Return user settings for the specified role.', type: UserSettingsEntity })
  async findByRoleAndCompany(
    @Param('role') role: string,
    @Param('companyId') companyId: string,
  ): Promise<UserSettingsEntity> {
    const settings = await this.userSettingsService.getSettingsForRole(role, companyId);
    if (!settings) {
      throw new Error(`No settings found for role ${role} in company ${companyId}`);
    }
    return settings;
  }
}