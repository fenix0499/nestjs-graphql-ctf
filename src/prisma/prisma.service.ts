import { Injectable, OnModuleInit, Logger, InternalServerErrorException, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient, Role, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { users, tasks } from './json/seed';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.debug('PrismaService connected!!!');
    await this.seed();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seed() {
    const createUserPromises = users.map((user) => (
      this.user.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password,
          role: user.role as Role,
          isDeleted: user.isDeleted,
        },
      })
    ));

    const tasksToAddPromises = tasks.map((task) => (
      this.task.create({
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status as TaskStatus,
          priority: task.priority as TaskPriority,
          createdById: task.createdById,
          assignedToId: task.assignedToId,
        },
      })
    ));

    await this.task.deleteMany(),
    await this.user.deleteMany(),
    await Promise.all(createUserPromises);
    await Promise.all(tasksToAddPromises);
  }

  public handlePrismaExceptions(error: any): never {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          // Unique constraint failed
          throw new ConflictException('A record with that value already exists.');
        case 'P2003':
          // Foreign key constraint failed
          throw new BadRequestException('Foreign key constraint failed.');
        case 'P2025':
          // Record not found
          throw new NotFoundException('Record not found.');
        case 'P2000':
          // Value too long for column
          throw new BadRequestException('Input value is too long for one of the fields.');
        case 'P2010':
          // Raw query error (e.g., SQL constraint violation)
          throw new BadRequestException('Invalid operation or constraint violation.');
        default:
          // Si el código no es manejado explícitamente
          throw new InternalServerErrorException('Unexpected database error.');
      }
    }

    // Si no es un error conocido de Prisma, relanzar o manejar genéricamente
    throw error;
  }
}
