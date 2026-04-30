// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/Entities/User.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const baseUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Verify your email — AlzheiCare',
        template: './verification',   // → templates/verification.hbs
        context: {
          firstName: user.firstName,
          url,
          expiresIn: '24 hours',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}