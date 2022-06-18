import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('auth.clientid'),
      clientSecret: configService.get('auth.clientsecret'),
      callbackURL: '/auth/42/callback',
      passReqToCallback: true,
      profileFields: {
        userId: 'id',
        email: 'email',
      },
    });
  }

  async validate(req, at, rt, profile, cb) {
    try {
      const result = await this.userService.findByOAuthId(profile.userId)
      ?? await this.userService.createByUserId(profile.userId, profile.email);
      if (result === undefined) {
        throw new Error('User not found');
      }
      cb(null, {
        seq: result,
      });
    } catch (err) {
      cb(err);
    }
  }
}
