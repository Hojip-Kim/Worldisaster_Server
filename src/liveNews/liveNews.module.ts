import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { LiveNewsService } from './liveNews.service';
import { LiveNewsController } from './liveNews.controller';
import { LiveNewsEntity } from './liveNews.entity';

import { OldDisastersEntity } from 'src/oldDisasters/oldDisasters.entity';

import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      OldDisastersEntity, 
      LiveNewsEntity
    ]),
  ],
  providers: [LiveNewsService],
  controllers: [LiveNewsController]
})
export class LiveNewsModule { }