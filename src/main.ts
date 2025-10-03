import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.FRONT_ORIGIN ?? 'http://localhost:3001',
      "https://jolly-dune-0d2eebb03.1.azurestaticapps.net"
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
