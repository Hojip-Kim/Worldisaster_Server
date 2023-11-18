import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // 특정 도메인 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 메소드
    allowedHeaders: 'Content-Type, Accept', // 허용할 헤더
    credentials: true, // 쿠키 허용
  });
  await app.listen(3000);

  
}

bootstrap();
