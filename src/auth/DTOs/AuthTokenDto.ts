import { IsNotEmpty, IsString } from 'class-validator';
export class AuthTokensDto {
    @IsString()
    @IsNotEmpty()
  accessToken?: string;
    @IsString()
    @IsNotEmpty()
  refreshToken?: string;
}