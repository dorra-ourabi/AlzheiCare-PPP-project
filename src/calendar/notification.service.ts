// src/calendar/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CalendarEvent } from './Entities/calendar-event.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationService');

  constructor(private mailerService: MailerService) {}

  async sendReminder(event: CalendarEvent, userEmail: string) {
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Reminder: ${event.title} is coming up`,
        html: `
          <h2>Upcoming Event Reminder</h2>
          <p>Your event <strong>${event.title}</strong> starts at 
          <strong>${event.startTime.toLocaleTimeString()}</strong>.</p>
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p>This is an automated reminder from AlzheiCare.</p>
        `,
      });
      this.logger.log(`Reminder sent to ${userEmail} for event: ${event.title}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder to ${userEmail}:`, error);
      throw error;
    }
  }
}