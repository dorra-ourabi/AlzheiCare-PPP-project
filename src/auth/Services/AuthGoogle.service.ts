// auth-google.service.ts
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';

import { SocialProfile } from '../interfaces/SocialProfile';
import { AuthGoogleLoginDto } from '../DTOs/AuthGoogleLoginDto';
import { User } from '../../users/Entities/User.entity';
import { UserRole } from '../../users/Enums/User.enum';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.google = new OAuth2Client(
      configService.get<string>('GOOGLE_CLIENT_ID'),
      configService.get<string>('GOOGLE_CLIENT_SECRET'),
    );
  }

  async getProfileByToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<{ accessToken: string; user: SocialProfile }> {
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

    const profile: SocialProfile = {
      id: data.sub,
      email: data.email!,
      firstName: data.given_name!,
      lastName: data.family_name!,
    };

    // Find or create user
    let user = await this.userRepository.findOne({
      where: { email: profile.email },
    });

    if (!user) {
      // Create new user from Google profile
      user = this.userRepository.create({
        email: profile.email,
        firstName: profile.firstName,
        secondName: profile.lastName,
        username: profile.email?.split('@')[0] || 'user', // Use email prefix as username
        password: '', // No password for social login
        Role: UserRole.Patient, // Default role
        isEmailVerified: true, // Google users are pre-verified
      });
      user = await this.userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
        role: user.Role,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') || 'dev_access_secret',
        expiresIn: '15m',
      },
    );

    return {
      accessToken,
      user: profile,
    };
  }
}