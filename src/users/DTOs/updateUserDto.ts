import { IsDate, isDate, IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../Enums/User.enum';

export class UpdateUserDto {
    @IsString()
    firstName?: string;
    @IsString()
    secondName?: string;
    @IsEmail()
    email?: string;
    @IsString()
    username?: string;
    @IsString( )
    @IsNotEmpty()
    password?: string;
    @IsOptional()
    @IsEnum(UserRole)
    Role?: UserRole;
    @IsDate( )
    UpdatedAt?: Date;
}