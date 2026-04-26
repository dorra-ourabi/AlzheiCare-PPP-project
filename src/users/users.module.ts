import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './Controllers/user.controller';
import { DoctorEntity } from './Entities/Doctor.entity';
import { PatientEntity } from './Entities/Patient.entity';
import { User } from './Entities/User.entity';
import { UserService } from './Services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PatientEntity, DoctorEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
