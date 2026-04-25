
import { PartialType } from '@nestjs/mapped-types';
import { User } from './User.entity';
import { Column } from 'typeorm';
import { IsDate, IsDateString } from 'class-validator';

export class PatientEntity extends PartialType(User) {
     @Column({nullable: false, })
     @IsDateString()
     DateOfBirth?: Date;
     @Column({nullable: true})
     @IsDateString()
     DateOfDiagnosis?: Date;
     @Column({nullable: false})
     @IsDateString()
     address?: string;
     @Column({nullable: true})
     
     phoneNumber?: string;
     @Column("simple-array", { nullable: false })
     caregiversNumbers?:string[];
}

    
