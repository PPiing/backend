import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import MockStrategy from './custom.mock';

@Injectable()
export class MyMockStrategy extends PassportStrategy(MockStrategy, '42') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(userId, email, login, cb) {
    const userInstance:any = await this.userService.findOrCreateByUserId(
      userId,
      email,
      login,
    );
    if (userInstance.secAuthStatus === false) {
      userInstance.isLogin = 'Y';
    }
    cb(null, userInstance);
  }
}
