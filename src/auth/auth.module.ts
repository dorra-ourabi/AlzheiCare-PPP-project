import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/Entities/User.entity';
import { AuthGoogleController } from './controllers/authGoogle.controller';
import { AuthService } from './Services/auth.service';
import { AuthGoogleService } from './Services/AuthGoogle.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev_secret',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthGoogleController],
    providers: [AuthService, AuthGoogleService],
})
export class AuthModule {}
