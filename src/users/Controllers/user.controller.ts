import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../DTOs/createUserDto';
import { LoginCredentialsDto } from '../DTOs/LoginCredentialsDto';
import { UserService } from '../Services/user.service';
import { JwtAuthGuard } from '../../auth/Guards/jwt.guard';
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @UseGuards(JwtAuthGuard)
    @Get()
    getUsers() {
        return this.userService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Post('add') 
    SubscribeUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
    @UseGuards(JwtAuthGuard)
    @Put('modif/:username')
    modifUser(
        @Body() createUserDto: CreateUserDto,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.userService.update(id, createUserDto);
    }
    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    deleteUser(@Param('id', ParseIntPipe) id: number): string {
        this.userService.remove(id);
        return `I'm a user with a specific id #${id} deleted from the database`;
    }
}