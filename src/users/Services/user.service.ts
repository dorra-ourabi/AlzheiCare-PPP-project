import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/User.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../DTOs/createUserDto';
import { LoginCredentialsDto } from '../DTOs/LoginCredentialsDto';

@Injectable()
export class UserService {
   constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
   ) {}
   
   async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }
  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  } 
 async create(user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(user) as User & { salt: string };
    const password = user.password;
    if (!password) {
      throw new Error('Password is required.');
    }
    newUser.salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, newUser.salt);
    try{await this.userRepository.save(newUser);}
    catch( e){
        console.error('Error creating user:', e);
        throw new ConflictException('Email already exists or name already exists');}
        
     
        
    return {
        email: newUser.email,
        username: newUser.username,

    };
  }

    async update(id: number, user: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser) {
      throw new Error(`User with id ${id} not found.`);
    }
    const updatedUser = this.userRepository.merge(existingUser, user);
    return await this.userRepository.save(updatedUser);
  }
  async remove(id: number){
    const existingUser = await this.userRepository.findOneBy({ id });       
    if (!existingUser) {
      throw new Error(`User with id ${id} not found.`);
    }   
    await this.userRepository.remove(existingUser);
    }

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
