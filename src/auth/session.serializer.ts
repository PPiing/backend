import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: UserDto, done) {
    done(null, user);
  }

  async deserializeUser(payload: UserDto, done) {
    try {
      const userInfo = payload;
      done(null, userInfo);
    } catch (err) {
      done(err);
    }
  }
}
