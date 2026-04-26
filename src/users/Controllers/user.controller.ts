import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
} from '@nestjs/common';
import { CreateUserDto } from '../DTOs/createUserDto';
import { LoginCredentialsDto } from '../DTOs/LoginCredentialsDto';
import { UserService } from '../Services/user.service';
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get()
    getUsers() {
        return this.userService.findAll();
    }
    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }
    @Post('add') 
    SubscribeUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
    @Put('modif/:username')
    modifUser(
        @Body() createUserDto: CreateUserDto,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.userService.update(id, createUserDto);
    }
    @Delete('delete/:id')
    deleteUser(@Param('id', ParseIntPipe) id: number): string {
        this.userService.remove(id);
        return `I'm a user with a specific id #${id} deleted from the database`;
    }
}