import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean } from "class-validator";

@ObjectType()
export class RemoveTask {
  @Field(() => Boolean)
  @IsBoolean()
  success: boolean;
}
