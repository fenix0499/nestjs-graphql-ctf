import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { HttpException, InternalServerErrorException, Logger, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/src/auth/decorators/roles/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver(() => User)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);
  
  constructor(
    private readonly userService: UserService,
  ) {}

  @Roles(Role.ADMIN, Role.MODERATOR)
  @Query(
    () => [User],
    {
      name: 'users',
      description: 'Require rol ADMIN or MODERATOR',
    }
  )
  async findAll() {
    try {
      return await this.userService.findAll();
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', new ParseUUIDPipe()) id: string) {
    try {
      return await this.userService.findOne(id);
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }      
    }
  }

  @Mutation(() => User, { name: 'updateUser' })
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    try {
      return await this.userService.update(updateUserInput.id, updateUserInput);
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }      
    }
  }

  @Roles(Role.ADMIN)
  @Mutation(
    () => User,
    {
      name: 'deleteUser',
      description: 'Require rol ADMIN',
    }
  )
  async deleteUser(@Args('id', new ParseUUIDPipe()) id: string) {
    try {
      return await this.userService.delete(id);
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }   
    }
  }
}
