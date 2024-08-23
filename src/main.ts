import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));  // Ajusta el límite según tus necesidades
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
   // Habilitar CORS
   app.enableCors({
    origin: '*', // Permite solicitudes desde cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(3000);
  logger.log('Reports running en el port ' + envs.port);
}

bootstrap();
