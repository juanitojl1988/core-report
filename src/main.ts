import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
 
  app.setGlobalPrefix('api/reports');
  app.use(bodyParser.json({ limit: '10mb' }));  // Ajusta el límite según tus necesidades
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.useStaticAssets(path.join(__dirname, '..', 'public'));
   // Habilitar CORS
   app.enableCors({
    origin: '*', // Permite solicitudes desde cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no deseadas
    forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no permitidas
    transform: true, // Transforma automáticamente el objeto en el tipo correspondiente
  }));

  await app.listen(3000);
  logger.log('Reports running en el port ' + envs.port);
}

bootstrap();
