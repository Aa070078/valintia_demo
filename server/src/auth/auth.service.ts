import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { PrismaService } from '../infrastructure/database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // 1. Find the user by username
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    // 2. User does not exist
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Compare submitted password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    // 4. Password is incorrect
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 5. Create JWT payload
    const payload = {
      sub: user.id,
      role: user.role,
    };

    // 6. Sign the JWT
    const accessToken = await this.jwtService.signAsync(payload);

    // 7. Return authentication result
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }
}