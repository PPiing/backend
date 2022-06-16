import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('auth.clientid'),
      clientSecret: configService.get('auth.clientsecret'),
      callbackURL: '/api/auth/42/callback',
      passReqToCallback: true,
      profileFields: {
        userId: 'id',
        email: 'email',
      },
    });
  }

  async validate(req, at, rt, profile, cb) {
    req.session.at = at;
    req.session.rt = rt;
    req.session.provider = profile.provider;
    // user create
    cb(null, {
      userId: profile.userId,
      email: profile.email,
    }); // req.user
  }
}
