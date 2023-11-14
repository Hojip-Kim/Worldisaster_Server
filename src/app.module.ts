import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DisastersModule } from './disasters/disasters.module';

import { DisastersListEntity } from './disasters/disasters-list.entity';
import { DisasterDetailEntity } from './disasters/disasters-detail.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'namamu',
      password: 'wjdrmf12#$',
      database: 'db_localhost',
      entities: [
        DisastersListEntity,
        DisasterDetailEntity,
      ],
      synchronize: true,
    }),
    DisastersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }