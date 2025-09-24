import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoleRequestStatus } from '@prisma/client';

export class UpdateRoleRequestDto {
  @ApiProperty({
    description: 'The new status for the role request',
    enum: RoleRequestStatus,
    example: RoleRequestStatus.APPROVED,
  })
  @IsEnum(RoleRequestStatus)
  @IsNotEmpty()
  status: RoleRequestStatus;

  @ApiProperty({
    description: 'The role to assign to the user if approved',
    example: 'manager',
    required: false,
  })
  @IsString()
  role?: string;
}
