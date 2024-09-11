import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
 
  app.setGlobalPrefix('api/reports');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true, 
    transform: true,
  }));

  await app.listen(3020);
  logger.log('Reports running en el port ' + 3020);
}

bootstrap();
