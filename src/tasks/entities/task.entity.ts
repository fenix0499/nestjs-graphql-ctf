import { ObjectType, Field, Int, registerEnumType, ID } from '@nestjs/graphql';
import { TaskStatus, TaskPriority } from '@prisma/client';

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
  description: 'Task Status',
});

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
  description: 'Task Priority',
});

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;
  
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() =>  TaskStatus)
  status: TaskStatus;

  @Field(() => TaskPriority)
  priority: TaskPriority;

  @Field({ nullable: true })
  dueDate?: Date;
  
  @Field({ nullable: true })
  createdAt?: Date;
  
  @Field({ nullable: true })
  updatedAt?: Date;

  // Relaciones

  // @Field(() => UserType)
  // createdBy: UserType;

  @Field(() => String)
  createdById: string;

  // @Field(() => UserType, { nullable: true })
  // assignedTo?: UserType;

  @Field(() => String, { nullable: true })
  assignedToId?: string;  
}
