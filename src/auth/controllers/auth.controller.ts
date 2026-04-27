import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../Services/auth.service';
import { LoginCredentialsDto } from '../../users/DTOs/LoginCredentialsDto';
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto';
import { AuthTokensDto } from '../DTOs/AuthTokenDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginCredentialsDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto): Promise<{ success: true }> {
    return this.authService.logout(dto);
  }
}