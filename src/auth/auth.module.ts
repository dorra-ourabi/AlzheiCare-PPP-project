import { Module } from '@nestjs/common';
import { User } from 'src/users/Entities/User.entity';
import { UserService } from 'src/users/Services/user.service';

@Module({
    imports:[UserService]
})
export class AuthModule {}
