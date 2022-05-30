import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // for Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ppiing Ppoong API')
    .setDescription('Ppiing Ppoong API 명세입니다.')
    .setVersion('0.1')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(3000);
}
bootstrap();
