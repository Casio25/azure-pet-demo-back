import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  app.setGlobalPrefix('api');

  app.set('trust proxy', 1);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = parseInt(process.env.PORT || '', 10) || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Nest is listening on :${port}`);
}
bootstrap();

