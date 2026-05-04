// src/calendar/scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addMinutes } from 'date-fns';
import { CalendarEvent } from './Entities/calendar-event.entity';
import { User } from '../users/Entities/User.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger('SchedulerService');

  constructor(
    @InjectRepository(CalendarEvent)
    private eventRepo: Repository<CalendarEvent>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkUpcomingEvents() {
    this.logger.debug('[Cron] Checking for upcoming events...');
    const now = new Date();
    const upcoming = await this.eventRepo.find({
      where: { notificationSent: false },
      relations: ['user'],
    });

    this.logger.debug(`Found ${upcoming.length} events that haven't sent notifications`);

    for (const event of upcoming) {
      const notifyBefore = event.notifyBefore ?? 30;
      const notifyAt = addMinutes(event.startTime, -notifyBefore);
      const shouldSend = now >= notifyAt && now <= event.startTime;

      this.logger.debug(`Event: ${event.title}, NotifyAt: ${notifyAt}, Now: ${now}, ShouldSend: ${shouldSend}`);

      if (!shouldSend) {
        continue;
      }

      if (!event.user?.email) {
        this.logger.warn(`Event ${event.id} has no user email`);
        continue;
      }

      try {
        await this.notificationService.sendReminder(event, event.user.email);
        event.notificationSent = true;
        await this.eventRepo.save(event);
        this.logger.log(`Notification sent and marked for event: ${event.title}`);
      } catch (error) {
        this.logger.error(`Failed to send notification for event ${event.id}:`, error);
      }
    }
  }
}