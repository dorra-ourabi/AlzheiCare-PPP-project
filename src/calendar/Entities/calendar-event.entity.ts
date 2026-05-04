// src/calendar/entities/calendar-event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/Entities/User.entity';

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: false })
  startTime!: Date;

  @Column({ nullable: false })
  endTime!: Date;

  @Column({ nullable: true })
  googleEventId?: string;

  @Column({ nullable: true })
  seriesId?: string;

  @Column({ nullable: false, default: 30 })
  notifyBefore!: number;

  @Column({ nullable: false, default: 'appointment' })
  category!: string;

  @Column({ default: false })
  repeatDaily!: boolean;

  @Column({ nullable: true })
  repeatUntil?: Date;

  @Column({ default: false })
  notificationSent!: boolean;

  @ManyToOne(() => User, user => user.events)
  user!: User;
}