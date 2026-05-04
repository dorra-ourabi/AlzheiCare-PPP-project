// src/calendar/calendar.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../Mail/mail.module';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { NotificationService } from './notification.service';
import { SchedulerService } from './scheduler.service';
import { CalendarEvent } from './Entities/calendar-event.entity';
import { User } from '../users/Entities/User.entity';
import { JwtAuthGuard } from '../auth/Guards/jwt.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, User]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'dev_access_secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [CalendarController],
  providers: [CalendarService, NotificationService, SchedulerService, JwtAuthGuard],
  exports: [CalendarService],
})
export class CalendarModule {}