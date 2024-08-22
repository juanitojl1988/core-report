import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));  // Ajusta el límite según tus necesidades
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.listen(3000);
  logger.log('Reports running en el port ' + envs.port);
}

bootstrap();
