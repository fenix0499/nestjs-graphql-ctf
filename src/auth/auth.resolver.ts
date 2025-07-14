import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login-auth.input';
import { SignupInput } from './dto/signup-auth.input';
import { HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { Auth } from './entities/auth.entity';

@Resolver()
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Mutation(() => Auth, { name: 'login' })
  login(@Args('loginInput') loginInput: LoginInput) {
    try {
      return this.authService.login(loginInput);
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  @Mutation(() => Auth, { name: 'register' })
  async signup(@Args('signupInput') signupInput: SignupInput) {
    try {
      return await this.authService.signup(signupInput);
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
