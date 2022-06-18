import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: any, done) {
    done(null, user);
  }

  async deserializeUser(payload: any, done) {
    try {
      const userInfo = await this.userService.findByUserSeq(payload.seq);
      done(null, userInfo);
    } catch (err) {
      done(err, payload);
    }
  }
}
