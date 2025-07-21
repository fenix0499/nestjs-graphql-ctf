import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  
  constructor(
    private readonly prismaService: PrismaService,
  ){}

  async findAll(): Promise<Task[] | undefined> {
    try {
      return await this.prismaService.task.findMany({
        where: {
          isDeleted: false,
        }
      });
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async create(authorId: string, createTaskInput: CreateTaskInput): Promise<Task | undefined> {
    try {
      return await this.prismaService.task.create({
        data: {
          id: randomUUID(),
          createdById: authorId,
          ...createTaskInput,
        }
      });
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }
  
  async findOne(id: string): Promise<Task | undefined> {
    try {
      const task = await this.prismaService.task.findUnique({
        where: {
          id,
          isDeleted: false,
        },
      });
      
      if (!task ) throw new NotFoundException('Task not found');
      
      return task;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async update(id: string, updateTaskInput: UpdateTaskInput): Promise<Task | undefined> {
    try {
      const updated = await this.prismaService.task.update({
        where: {
          id,
          isDeleted: false,
        },
        data: {
          ...updateTaskInput,
        }
      });

      return updated;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      const task = await this.prismaService.task.update({
        where: {
          id,
        },
        data: {
          isDeleted: false,
        },
      });

      return !!task;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const deleted = await this.prismaService.$executeRawUnsafe(
        `UPDATE task SET isDeleted = true WHERE isDeleted = false AND id = '${id}';`,
      );

      return deleted > 0;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      this.prismaService.handlePrismaExceptions(error);
    }
  }
}
