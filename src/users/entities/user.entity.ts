import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  username: string | null;
  @ApiProperty({ required: false })
  role: string | null;

  @ApiProperty({ required: false })
  email: string | null;

  @Exclude()
  @ApiProperty({ required: false })
  password: string | null;

  @ApiProperty({ required: false })
  refresh_token: string | null;

  @ApiProperty({ required: false })
  company_id: string | null;

  @ApiProperty({ required: false })
  business_name: string | null;

  @ApiProperty({ required: false })
  google_id: string | null;

  @ApiProperty({ required: false })
  apple_id: string | null;

  @ApiProperty({ required: false })
  image_url: string | null;

  @ApiProperty({ required: false, type: () => [String] })
  logs: string[];
}
