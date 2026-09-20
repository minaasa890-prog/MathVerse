import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {

  constructor(
    private prisma: PrismaService,
  ) {}

  async create(data: any) {

    const user = await this.prisma.user.create({
      data,
    });

    const { password, ...result } = user;

    return result;
  }

  async findByEmail(email: string) {

    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });

  }

}