import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Autoriser les requêtes depuis le frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // Validation globale des données
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(
      app.get(Reflector)
    )
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Portail cartographique de l’aviation à Madagascar')
    .addBearerAuth()
    .setDescription(
      'API de gestion des infrastructures aéronautiques, des pistes, ' +
      'des aéronefs, des exploitants, des localités et des sources de données.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrer le token JWT obtenu après connexion.',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    jsonDocumentUrl: 'api/docs-json',
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log('API : http://localhost:3000');
  console.log('Swagger : http://localhost:3000/api');
}

bootstrap();