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
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserEntity } from '../entities/user.entity';
import { multerConfig } from 'src/config/multer.config';
import { Express } from 'express';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @ApiOkResponse({ type: CreateUserDto, isArray: true })
  @Get()
  async getUsers() {
    const users = this.userService.findAll();
    return (await users).map((user) => new UserEntity(user));
  }
  @Get(':id')
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
  @Patch('profile/picture/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async updateProfilePicture(
    @UploadedFile() image: any,
    @Param('id') id: string,
  ) {
    const imagePath = image ? image.path : null;
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
}
