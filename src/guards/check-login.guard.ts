import {
  CanActivate, ExecutionContext, HttpException, Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CheckLogin implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.switchToHttp().getRequest().isAuthenticated()) {
      console.log(context.switchToHttp().getRequest().session);
      if (context.switchToHttp().getRequest().session.passport.user.is_login === 'Y') {
        console.log('이 후에 API를 사용할 수 있습니다.');
        return true;
      }
      console.log('이 후에 API를 사용할 수 없습니다.');
      return false;
    }
    throw new HttpException('로그인이 필요합니다.', 401);
  }
}
