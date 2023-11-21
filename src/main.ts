import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  //   app.enableCors({
  //     origin: configService.get('https://worldisaster.vercel.app/'),
  //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //     credentials: true,
  // })
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  })

  // if (frontendUrl) {

  //   });
  // }

  await app.listen(3001, "0.0.0.0");
}
bootstrap();
