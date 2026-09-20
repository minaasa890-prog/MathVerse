import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // =====================================================
  // REGISTER
  // =====================================================

  async register(data: any) {
    const existingUser =
      await this.usersService.findByEmail(
        data.email,
      );

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        10,
      );

    const user =
      await this.usersService.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      });

    return {
      message:
        'User created successfully',

      user,
    };
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByEmail(
        email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // ===================================================
    // JWT
    // ===================================================

    const token =
      this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

    // ===================================================
    // RESPONSE
    // ===================================================

    return {
      message:
        'Login successful',

      access_token:
        token,

      user: {
        id: user.id,

        name: user.name,

        email: user.email,

        role: user.role,

        classroomId:
          user.classroomId,
      },
    };
  }
}