import { IsEmail, IsString,IsNotEmpty } from 'class-validator';
export class LoginCredentialsDto {
   
    @IsString()
    @IsNotEmpty()
username?: string;
    @IsString()
    @IsNotEmpty()
    password?: string;
}   