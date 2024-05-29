import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  const config = new DocumentBuilder()
    .setTitle('Email verification example')
    .setDescription('Example email verification app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get<number>("APP_PORT"), configService.get<string>("APP_HOST"));
}
bootstrap();
