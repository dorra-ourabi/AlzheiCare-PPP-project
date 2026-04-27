import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/Entities/User.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthGoogleController } from './controllers/authGoogle.controller';
import { AuthService } from './Services/auth.service';
import { AuthGoogleService } from './Services/AuthGoogle.service';
import { RedisService } from './Services/Redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, AuthGoogleController],
  providers: [AuthService, AuthGoogleService, RedisService],
})
export class AuthModule {}