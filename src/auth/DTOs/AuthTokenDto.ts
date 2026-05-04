import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';
export class AuthTokensDto {
    @IsString()
    @IsNotEmpty()
  accessToken!: string;
    @IsString()
    @IsNotEmpty()
  refreshToken!: string;
    @IsObject()
    @IsOptional()
  user?: {
    id: number;
    username: string;
    email?: string;
    firstName?: string;
    secondName?: string;
  };
}