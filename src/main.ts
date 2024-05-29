import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  const configService = app.get<ConfigService>(ConfigService);
  await app.listen(configService.get<number>("APP_PORT"), configService.get<string>("APP_HOST"));
}
bootstrap();
