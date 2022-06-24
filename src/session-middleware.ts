import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import * as SessionFileStore from 'session-file-store';

type Middleware = (req: any, res: any, next: (error?: any) => void) => void;

@Injectable()
export class SessionMiddleware {
  expressSession: Middleware;

  passportInit: Middleware;

  passportSession: Middleware;

  constructor(private configService: ConfigService) {
    const store = new SessionFileStore(session)();
    this.expressSession = session({
      secret: this.configService.get('auth.secret'),
      resave: false,
      saveUninitialized: true,
      store,
    });
    this.passportInit = passport.initialize();
    this.passportSession = passport.session();
  }
}
