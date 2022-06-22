import * as session from 'express-session';
import * as passport from 'passport';

export const expressSession = session({
  secret: process.env.AUTH_SECRET,
  resave: false,
  saveUninitialized: true,
});

export const passportInit = passport.initialize();
export const passportSession = passport.session();
