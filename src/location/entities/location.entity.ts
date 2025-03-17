import { ApiProperty } from '@nestjs/swagger';
import { Location } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class LocationEntity implements Location {
  constructor(partial: Partial<Location> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  @IsOptional()
  @IsString()
  @ApiProperty()
  id: string;
  @IsOptional()
  @IsString()
  @ApiProperty()
  location_name: string;
}
