
import { PartialType } from '@nestjs/mapped-types';
import { User } from './User.entity';
import { Column } from 'typeorm';
import { IsNotEmpty } from 'class-validator/types/decorator/common/IsNotEmpty';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class DoctorEntity extends PartialType(User) {
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

    
