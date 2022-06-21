import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';

@Injectable()
export class SocketGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (context.switchToWs().getClient().isAuthenticated()) {
      return true;
    }
    throw new WsException('로그인이 필요합니다.');
  }
}
