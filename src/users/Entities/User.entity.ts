import { Generic } from "src/Generic/generic";
import { UserRole } from "../Enums/User.enum";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";

@Entity('User')
export class User extends Generic{
    @PrimaryGeneratedColumn('uuid')
    id?: number;
    @IsNotEmpty()
    @Column(
        {unique: true,
        nullable: false
        }
    )
    username?: string;
    @IsEmail()
    @Column(
        {unique: true,
        nullable: false}
    )
    email?: string;
    @Column(
            {nullable: false,
            unique: true}
    )
    password?: string;
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.Patient
    })
    
    Role?: UserRole;

  
}

    


    

