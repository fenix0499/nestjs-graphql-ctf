import { InputType, Int, Field, registerEnumType } from '@nestjs/graphql';
import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Task Status',
});

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
  description: 'Task Priority',
});

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() =>  TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: Date;
  
  // Relaciones

  // @Field(() => UserType)
  // createdBy: UserType;

  // @Field(() => String)
  // @IsString()
  // createdById: string;

  // @Field(() => UserType, { nullable: true })
  // assignedTo?: UserType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  assignedToId: string;
}
