import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { LoginCredentialsDto } from '../../users/DTOs/LoginCredentialsDto';
import { User } from '../../users/Entities/User.entity';

export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private readonly jwtService: JwtService) {}
    async Login(loginDto: LoginCredentialsDto) {
        const user = await this.userRepository.findOneBy({ username: loginDto.username });    

    if (!user) {        
        throw new NotFoundException('Invalid username');
    }

    if (!loginDto.password || !user.password) {
        throw new NotFoundException('Invalid username or password.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
        throw new NotFoundException('Invalid Password.');
    }
    const jwt = await this.jwtService.signAsync({ username: user.username, role: user.Role });
   return {
        
        token: jwt
    };
}}
