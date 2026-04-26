
import { PartialType } from '@nestjs/mapped-types';
import { User } from './User.entity';
import { Column } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';

export class DoctorEntity extends User {
    @Column({
        nullable:false,
        unique:true
    })
    @IsNotEmpty()
    liscenceNumber?: string;
        @Column({nullable: false})
        @IsString()
     specialization?: string;
     @Column({nullable: true})
     phoneNumber?: string;
     
}

    
