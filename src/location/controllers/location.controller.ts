import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { LocationService } from '../services/location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get('locations')
  async getLocations(@Request() req: any) {
    return await this.locationService.getLocations(req.user.company_id);
  }
  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    return await this.locationService.getLocationById(id);
  }
  @Post('add')
  async addLocation(
    @Body() createLocation: CreateLocationDto,
    @Request() req: any,
  ) {
    return await this.locationService.addLocation(
      createLocation,
      req.user.id,
      req.user.company_id,
    );
  }
  @Put('edit')
  async editLocation(@Body() updateLocation: UpdateLocationDto) {
    return await this.locationService.editLocation(updateLocation);
  }
  @Delete(':id')
  async deleteLocation(@Param('id') id: string, @Request() req: any) {
    return await this.locationService.deleteLocation(id, req.user.id);
  }
}
