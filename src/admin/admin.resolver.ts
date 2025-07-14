import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { ConflictException, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/src/auth/decorators/roles/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Resolver(() => Admin)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => Admin, { name: 'fileRead' })
  async fileRead(@Args('fileName', { type: () => String }) fileName: string) {
    try {
      return this.adminService.fileRead(fileName);
    } catch (error) {
      throw new NotFoundException('File not found...');
    }
  }

  @Query(() => Admin, { name: 'commandExecution' })
  commandExecution(
    @Args('cmd', { type: () => String }) cmd: string,
    @Context() context,
  ) {
    try {
      const flag = context.req.devMode;

      if (!flag) throw new UnauthorizedException('Requires devMode flag enabled in token...');
  
      return this.adminService.commandExecution(cmd);
    } catch(error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new ConflictException('Error in command...');
    }
  }
}
