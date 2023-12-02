import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true, // 어디서든 접근 가능하고
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 이 방법들만 가능하며
    credentials: true, // Header에 쿠키나 인증 관련 값을 넣어서 소통 가능
  })
  await app.listen(3001, "0.0.0.0");
}
bootstrap();
