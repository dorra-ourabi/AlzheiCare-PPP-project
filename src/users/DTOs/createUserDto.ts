import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../Enums/User.enum';
export class CreateUserDto {
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
    @IsString()
    Role?: UserRole;
    
}