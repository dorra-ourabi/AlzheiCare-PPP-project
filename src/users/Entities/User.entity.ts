import { Generic } from "src/Generic/generic";
import { UserRole } from "../Enums/User.enum";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { CalendarEvent } from "../../calendar/Entities/calendar-event.entity";

@Entity('User')
export class User extends Generic {
    @PrimaryGeneratedColumn()
    id?: number;

    @IsNotEmpty()
    @Column({ unique: true, nullable: false })
    username?: string;

    @Column({ nullable: false })
    firstName?: string;

    @Column({ nullable: false })
    secondName?: string;

    @IsEmail()
    @Column({ unique: true, nullable: false })
    email?: string;

    @Column({ nullable: false })
    password?: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.Patient
    })
    Role?: UserRole;

    // --- Email verification fields ---
    @Column({ type: 'varchar', nullable: true, default: null })
    emailVerificationToken?: string | null;

    @Column({ type: 'timestamp', nullable: true, default: null })
    emailVerificationExpiresAt?: Date | null;

    @Column({ type: 'boolean', default: false })
    isEmailVerified?: boolean;

    @Column({ type: 'varchar', nullable: true })
    googleAccessToken?: string | null;

    @Column({ type: 'varchar', nullable: true })
    googleRefreshToken?: string | null;

    @Column({ type: 'varchar', nullable: true })
    googleCalendarChannelId?: string | null;

    @Column({ type: 'varchar', nullable: true })
    googleCalendarResourceId?: string | null;

    @Column({ type: 'varchar', nullable: true })
    googleCalendarSyncToken?: string | null;

    @Column({ type: 'bigint', nullable: true })
    googleCalendarChannelExpiresAt?: number | null;

    @OneToMany(() => CalendarEvent, event => event.user)
    events?: CalendarEvent[];
}