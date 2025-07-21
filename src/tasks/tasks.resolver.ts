import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskInput } from './dto/create-task.input';
import { UpdateTaskInput } from './dto/update-task.input';
import { Role, Task  as TaskEntity } from "@prisma/client";
import { HttpException, InternalServerErrorException, Logger, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/src/auth/decorators/roles/roles.decorator';
import { RemoveTask } from './entities/removeTask.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver(() => Task)
export class TasksResolver {
  private readonly logger = new Logger(TasksResolver.name);
  
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Query(() => [Task], { name: 'tasks' })
  async findAll() {
    try {
      return await this.tasksService.findAll();
    } catch (error) {
      
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Query(() => Task, { name: 'task' })
  findOne(@Args('id', new ParseUUIDPipe()) id: string) {
    try {
      return this.tasksService.findOne(id);
    } catch(error) {
      
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
  
  @Mutation(() => Task, { name: 'createTask' })
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
    @Context('req') req: any,
  ): Promise<TaskEntity | undefined> {
    try {
      return await this.tasksService.create(req.user.id, createTaskInput);
    } catch (error) {
      
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Mutation(() => Task, { name: 'updateTask' })
  async updateTask(@Args('updateTaskInput') updateTaskInput: UpdateTaskInput): Promise<TaskEntity | undefined> {
    try {
      return await this.tasksService.update(updateTaskInput.id, updateTaskInput);
    } catch(error) {
      
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  // Aqui va a estar la inyeccion sql...
  @Roles(Role.ADMIN, Role.MODERATOR)
  @Mutation(
    () => RemoveTask,
    {
      name: 'removeTask',
      description: 'Require rol ADMIN or MODERATOR',
    }
  )
  async removeTask(
    @Args('id', { type: () => String }) id: string,
  ):  Promise<RemoveTask> {
    const result = await this.tasksService.remove(id);
    return {
      success: result,
    };
  }

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Mutation(
    () => RemoveTask,
    {
      name: 'restoreTask',
      description: 'Require rol ADMIN or MODERATOR',
    }
  )
  async restoreTask(
    @Args('id', new ParseUUIDPipe()) id: string,
  ): Promise<RemoveTask> {
    const result = await this.tasksService.restore(id);
    return {
      success: result,
    }
  }
}
