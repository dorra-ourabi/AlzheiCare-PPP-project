import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
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
}