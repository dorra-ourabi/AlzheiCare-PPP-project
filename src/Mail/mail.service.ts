// src/mail/mail.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/Entities/User.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const baseUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #4F46E5; margin-bottom: 24px; }
            .btn { display: inline-block; padding: 14px 28px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 24px 0; }
            .footer { margin-top: 32px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">AlzheiCare</div>
            <h2>Hello, ${user.firstName}!</h2>
            <p>Thank you for registering. Please verify your email to activate your account.</p>
            <a href="${url}" class="btn">Verify my Email</a>
            <p>This link expires in <strong>24 hours</strong>.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <div class="footer">&copy; 2026 AlzheiCare. All rights reserved.</div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.mailer.sendMail({
        to: user.email,
        subject: 'Verify your email — AlzheiCare',
        html,   // ← direct HTML, no template needed
      });
      console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}