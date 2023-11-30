import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { LiveNewsService } from './liveNews.service';
import { LiveNewsController } from './liveNews.controller';
import { LiveNewsEntity } from './liveNews.entity';

import { NewDisastersEntity } from '../newDisasters/newDisasters.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      NewDisastersEntity, 
      LiveNewsEntity
    ]),
  ],
  providers: [LiveNewsService],
  controllers: [LiveNewsController]
})
export class LiveNewsModule { }