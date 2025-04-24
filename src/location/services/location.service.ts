import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { NotificationsGateway } from 'src/notifications/gateways/notifications.gateway';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationsGateway,
  ) {}
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
  async addLocation(createLocation: CreateLocationDto, userId: string) {
    const location = await this.prisma.location.create({
      data: { ...createLocation },
    });
    if (location) {
      await this.notificationGateway.sendBroadcastNotification(
        userId,
        `Location called ${location.location_name} is created`,
      );
    }
    return location;
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
  async deleteLocation(id: string, userId: string) {
    if (await this.locationExists(id)) {
      const location = await this.prisma.location.delete({ where: { id } });
      if (location) {
        await this.notificationGateway.sendBroadcastNotification(
          userId,
          `Location called ${location.location_name} is deleted`,
        );
      }
      return location;
    } else {
      throw new NotFoundException('the location doesnot exist');
    }
  }
}
