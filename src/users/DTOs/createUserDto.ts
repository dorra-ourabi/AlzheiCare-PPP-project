import {IsString,IsEmail, IsNotEmpty} from 'class-validator';
export class CreateUserDto {
    @IsEmail()
    email?: string;
    @IsString()
    username?: string;
    @IsString( )
    @IsNotEmpty()
    password?: string;
}