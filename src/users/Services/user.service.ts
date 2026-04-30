import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Entities/User.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../DTOs/createUserDto';
import { LoginCredentialsDto } from '../DTOs/LoginCredentialsDto';
import { MailService } from 'src/Mail/mail.service';
@Injectable()
export class UserService {
   constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
   ) {}
   
   async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users;
  }
  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
  } 
async create(user: CreateUserDto): Promise<User> {
  const newUser = this.userRepository.create(user);

  if (!user.password) {
    throw new Error('Password is required.');
  }

  newUser.password = await bcrypt.hash(user.password, 10);
  newUser.isEmailVerified = false;
  newUser.emailVerificationToken = randomBytes(32).toString('hex'); // 1. generate token
  newUser.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await this.userRepository.save(newUser); // 2. save to DB
    await this.mailService.sendVerificationEmail(newUser, newUser.emailVerificationToken); // 3. send email
  } catch (e) {
    console.error('Error creating user:', e);
    throw new ConflictException('Email already exists or name already exists');
  }

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
    updatedUser.UpdatedAt = new Date();
    return await this.userRepository.save(updatedUser);
  }
  async remove(id: number){
    const existingUser = await this.userRepository.findOneBy({ id });       
    if (!existingUser) {
      throw new Error(`User with id ${id} not found.`);
    }   

    await this.userRepository.remove(existingUser);
    }

  }