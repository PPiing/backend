import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import MockStrategy from './custom.mock';

@Injectable()
export class MyMockStrategy extends PassportStrategy(MockStrategy, '42') {
  constructor(
    private readonly userService: UserService,
  ) {
    super();
  }

  async validate(mockId, cb) {
    const result = await this.userService.findByOAuthId(mockId);
    cb(null, {
      seq: result,
    });
  }
}
