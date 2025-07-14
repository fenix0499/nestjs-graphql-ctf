import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

registerEnumType(Role, {
  name: 'Role',
  description: 'Role',
});

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  username: string;

  // @Field(() => String)
  // password: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Boolean)
  isDeleted: boolean;
}
