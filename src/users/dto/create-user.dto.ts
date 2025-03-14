import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  facebookId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  provider?: string; // 'facebook' or 'google'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiProperty({ required: false, default: new Date() })
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({ required: false, default: new Date() })
  @IsOptional()
  updatedAt?: Date;
}
