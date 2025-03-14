import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'login successful',
    description: 'the success message',
  })
  message: string;
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'token',
  })
  token: string;
}
export class LoginBodyDto {
  @ApiProperty({
    example: 'john doe',
    description: 'username',
  })
  username: string;
  @ApiProperty({
    example: 'johndoepassword',
    description: 'password',
  })
  password: string;
}
export class logoutResponseDto {
  @ApiProperty({
    example: 'Logout successful',
    description: 'success logout message',
  })
  message: string;
}
export class logoutBadResponseDto {
  @ApiProperty({
    example: 'Logout failed',
    description: 'failed logout message',
  })
  message: string;
}
