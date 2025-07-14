import { Field, ObjectType } from "@nestjs/graphql";
import { IsJWT } from "class-validator";

@ObjectType()
export class Auth {
  @Field(() => String)
  @IsJWT()
  accessToken: string;
}
