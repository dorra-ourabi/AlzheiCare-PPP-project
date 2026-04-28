// auth-google.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginTicket, OAuth2Client } from 'google-auth-library';

import { SocialProfile } from '../interfaces/SocialProfile';

import { AuthGoogleLoginDto } from '../DTOs/AuthGoogleLoginDto';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;
//dont forget to add the google client id and secret in the .env file
  constructor(private readonly configService: ConfigService) {
    this.google = new OAuth2Client(
      configService.get<string>('GOOGLE_CLIENT_ID'),
      configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async getProfileByToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<SocialProfile> {
    if (!loginDto.idToken) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user: 'wrongToken' },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const ticket: LoginTicket = await this.google.verifyIdToken({
      idToken: loginDto.idToken,
      audience: [this.configService.get<string>('GOOGLE_CLIENT_ID')!],
    });

    const data = ticket.getPayload();

    if (!data) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { user: 'wrongToken' },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return {
      id: data.sub,
      email: data.email,
      firstName: data.given_name,
      lastName: data.family_name,
    };
  }
}