import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
  UploadedFile,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserEntity } from '../entities/user.entity';
import { multerConfig } from 'src/config/multer.config';
import { Express } from 'express';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateRoleRequestDto } from '../dto/role-request.dto';
import { RoleRequestStatus } from '@prisma/client';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @ApiOkResponse({ type: CreateUserDto, isArray: true })
  @Get()
  async getUsers() {
    const users = this.userService.findAll();
    return (await users).map((user) => new UserEntity(user));
  }
  @Get('user/:id')
  async getUser(@Param('id') id: string) {
    return new UserEntity(await this.userService.findById(id));
  }

  @Patch('profile/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(updateUserDto, id);
  }
  @Patch('profile-picture/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async updateProfilePicture(
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: string,
  ) {
    const imagePath = image ? image.path : null;
    console.log('image path', imagePath);
    return this.userService.updateProfilePicture(imagePath, id);
  }
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
  @Patch('update-previeleges')
  async updatePrevieleges(@Body() roleAndPrevilege: RolePrevielegeInt[]) {
    return this.userService.updatePrevieleges(roleAndPrevilege);
  }
  @Patch('single-update-previeleges')
  async singleUpdatePrevieleges(@Body() roleAndPrevilege: RolePrevielegeInt) {
    return this.userService.singleUpdatePrevieleges(roleAndPrevilege);
  }
  @Get('get-previeleges')
  async getPrevieleges() {
    return this.userService.getPrevieleges();
  }

  @Patch('role-request/:userId')
  @ApiOkResponse({ description: 'Role request updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRoleRequest(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateRoleRequestDto,
  ) {
    return this.userService.updateRoleRequest(userId, updateDto);
  }

  @Get('pending-requests')
  @ApiOkResponse({ type: [UserEntity] })
  async getPendingRoleRequests() {
    const users = await this.userService.findAll();
    return users
      .filter((user) => user.role_request_approval === 'PENDING')
      .map((user) => new UserEntity(user));
  }
}
