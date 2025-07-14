import { randomUUID, createHash } from 'node:crypto';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  constructor(
    private readonly prismaService: PrismaService,
  ){}

  async findAll() {
    try {
      return await this.prismaService.user.findMany({
        where: {
          isDeleted: false,
          role: {
            not: Role.ADMIN,
          },
        },
      });
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }
  
  async create(createUserInput: CreateUserInput) {
    try {
      const user = await this.prismaService.user.create({
        data: {
          id: randomUUID(),
          ...createUserInput,
        }
      });
      return user;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async findByUsername(username: string): Promise<User | undefined | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          username,
        },
      });

      // if (!user) {
      //   throw new NotFoundException('User not found...');
      // }
      
      return user;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      
      return user;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async update(id: string, updateUserInput: UpdateUserInput) {
    const { id:_, password, ...rest } = updateUserInput;
    
    try {
     const user = await this.prismaService.user.update({
       where: {
         id,
       },
       data: {
         ...rest,
         ...(password && {
           password: createHash('sha256').update(password).digest('hex'),
         })
       },
     });

     return user;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async delete(id: string) {
    try {
      return await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          isDeleted: true,
        },
      });
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }
}
