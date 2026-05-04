import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { LoginCredentialsDto } from '../../users/DTOs/LoginCredentialsDto';
import { User } from '../../users/Entities/User.entity';
import { RefreshTokenDto } from '../DTOs/RefreshTokenDto';
import { AuthTokensDto } from '../DTOs/AuthTokenDto';
import { RedisService } from './Redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginCredentialsDto): Promise<AuthTokensDto> {
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

    const sessionId = randomUUID();
    const tokens = await this.buildTokens(user, sessionId);

    await this.storeRefreshHash(sessionId, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id!,
        username: user.username!,
        email: user.email,
        firstName: user.firstName,
        secondName: user.secondName,
      },
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokensDto> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const sessionId = payload.sessionId;
    const userId = payload.sub;

    const storedHash = await this.redisService.get(this.sessionKey(sessionId));
    if (!storedHash || storedHash !== this.hashToken(dto.refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.buildTokens(user, sessionId);
    await this.storeRefreshHash(sessionId, tokens.refreshToken);

    return tokens;
  }

  async logout(dto: RefreshTokenDto): Promise<{ success: true }> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    await this.redisService.del(this.sessionKey(payload.sessionId));
    return { success: true };
  }

  private async buildTokens(user: User, sessionId: string): Promise<AuthTokensDto> {
    if (!user.id || !user.username || !user.Role) {
      throw new UnauthorizedException('User data incomplete for token generation');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
        role: user.Role,
        sessionId,
      },
      {
        secret: this.accessSecret(),
        expiresIn: this.accessExpires(),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sessionId,
      },
      {
        secret: this.refreshSecret(),
        expiresIn: this.refreshExpires(),
      },
    );

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<{ sub: number; sessionId: string }> {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async storeRefreshHash(sessionId: string, refreshToken: string) {
    const ttlSeconds = this.refreshExpires();
    await this.redisService.set(this.sessionKey(sessionId), this.hashToken(refreshToken), ttlSeconds);
  }


  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private sessionKey(sessionId: string) {
    return `session:${sessionId}`;
  }

  private accessSecret() {
    return this.configService.get<string>('JWT_ACCESS_SECRET');
  }

  private refreshSecret() {
    return this.configService.get<string>('JWT_REFRESH_SECRET') ;
  }

  private accessExpires() {
    const raw = this.configService.get('JWT_ACCESS_EXPIRES');
    return this.parseExpiresToSeconds(raw, 60 * 15);
  }

  private refreshExpires() {
    const raw = this.configService.get('JWT_REFRESH_EXPIRES') ;
    return this.parseExpiresToSeconds(raw, 60 * 60 * 24*7 );
  }

  private parseExpiresToSeconds(value: string, fallback: number) {
    const match = /^(\d+)([smhdwy])$/.exec(value);
    if (!match) return fallback;
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      y: 31536000,
    };
    return amount * (multipliers[unit] || 1);
  }
}