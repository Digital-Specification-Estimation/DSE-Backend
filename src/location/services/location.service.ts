import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}
  async getLocations() {
    return this.prisma.location.findMany();
  }
  async locationExists(id: string) {
    const location = await this.prisma.location.findUnique({ where: { id } });
    return !!location;
  }
  async getLocationById(id: string) {
    if (await this.locationExists(id)) {
      return this.prisma.location.findUnique({ where: { id } });
    } else {
      throw new NotFoundException('the location doesnot exist');
    }
  }
  async addLocation(createLocation: CreateLocationDto) {
    return this.prisma.location.create({ data: { ...createLocation } });
  }
  async editLocation(updateLocation: UpdateLocationDto) {
    if (!updateLocation.id) {
      throw new NotFoundException('the location id not found');
    }
    if (await this.locationExists(updateLocation.id)) {
      return this.prisma.location.update({
        where: { id: updateLocation.id },
        data: { ...updateLocation },
      });
    } else {
      throw new NotFoundException('the location doesnot exist');
    }
  }
  async deleteLocation(id: string) {
    if (await this.locationExists(id)) {
      return this.prisma.location.delete({ where: { id } });
    } else {
      throw new NotFoundException('the location doesnot exist');
    }
  }
}
