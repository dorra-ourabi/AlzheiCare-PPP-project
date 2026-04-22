import { Module } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserServiceService } from './user.service/user.service.service';

@Module({
  providers: [UsersService, UserServiceService]
})
export class UsersModule {}
