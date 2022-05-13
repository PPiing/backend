import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'verbose', 'error', 'warn', 'debug'],
  });
  const configService = app.get(ConfigService);

  app.use(
    session({
      secret: configService.get('auth.secret'),
      resave: false,
      saveUninitialized: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
