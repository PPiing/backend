import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'verbose', 'error', 'warn', 'debug'],
  });

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
