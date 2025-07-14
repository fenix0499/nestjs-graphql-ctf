import { ObjectType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType()
export class Admin {
  @Field(() => String, { description: 'Command output...' })
  @IsString()
  output: string;
}
