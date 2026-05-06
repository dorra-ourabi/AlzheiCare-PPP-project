import { Generic } from "src/Generic/generic";
import { UserRole } from "../Enums/User.enum";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";

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
}