import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthGoogleLoginDto } from '../DTOs/AuthGoogleLoginDto';
import { SocialProfile } from '../interfaces/SocialProfile';
import { AuthGoogleService } from '../Services/AuthGoogle.service';

@ApiTags('Auth')
@Controller({
  path: 'auth/google',
  version: '1',
})
export class AuthGoogleController {
  constructor(private readonly service: AuthGoogleService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: Object,
  })
  async login(
    @Body() loginDto: AuthGoogleLoginDto,
  ): Promise<{ accessToken: string; user: SocialProfile }> {
    return this.service.getProfileByToken(loginDto);
  }
}