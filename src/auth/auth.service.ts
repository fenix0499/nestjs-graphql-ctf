import * as crypto from "node:crypto";
import { Temporal } from '@js-temporal/polyfill';
import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SignupInput } from './dto/signup-auth.input';
import { LoginInput } from './dto/login-auth.input';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ){}

  private hash(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    return hashedPassword === this.hash(password);  
  }

  private createAccessToken(user: User): { accessToken: string } {
    return {
      accessToken: this.jwtService.sign({
        username: user.username,
        role: user.role,
        issuedAt: Temporal.Now.instant().epochMilliseconds, 
      }),
    };
  }

  public async findUser(username: string): Promise<User | null | undefined> {
    return await this.userService.findByUsername(username);
  }

  public async signup(signupInput: SignupInput) {
    try {
      if (await this.userService.findByUsername(signupInput.username)) {
        throw new ConflictException('User already exists...');
      }

      const { password, username } = signupInput;
      const hashedPassword = this.hash(password);

      const user = await this.userService.create({
        username,
        password: hashedPassword,
      });

      return this.createAccessToken(user);
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  public async login(loginInput: LoginInput) {
    try {
      const { username, password } = loginInput;

      const user = await this.userService.findByUsername(username);

      if (!user) {
        throw new Error();
      } 

      const passwordMatch = await this.verifyPassword(password, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException('Username or password may be incorrect...');
      }

      return this.createAccessToken(user);
    } catch(error) {
      this.logger.error(JSON.stringify(error));
      if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
