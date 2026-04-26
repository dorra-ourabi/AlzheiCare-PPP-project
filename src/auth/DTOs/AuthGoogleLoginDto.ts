import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthGoogleLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  idToken?: string;
}