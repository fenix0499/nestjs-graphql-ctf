import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ){}
  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    try {
      const token = this.getToken(request);
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findByUsername(payload.username);
      
      if (!user) {
        throw new UnauthorizedException('User not found...');
      }

      request.devMode = Object.hasOwn(payload, 'devMode') && (typeof payload['devMode'] === 'boolean') && payload['devMode'];
      request.user = user;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private getToken(request: {
    headers: Record<string, string | string[]>;
  }): string {
    const authorization = request.headers['authorization'];

    if (!authorization || Array.isArray(authorization)) {
      throw new Error('Invalid Authorization Header');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer') {
      throw new Error('Invalid Token Type');
    }
    
    return token;
  }
}
