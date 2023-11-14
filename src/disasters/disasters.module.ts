import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DisastersListService } from './disasters.service';
import { DisastersController } from './disasters.controller';
import { DisastersListEntity } from './disasters-list.entity';
import { DisasterDetailEntity } from './disasters-detail.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([DisastersListEntity]),
    TypeOrmModule.forFeature([DisasterDetailEntity]),
  ],
  providers: [DisastersListService],
  controllers: [DisastersController]
})
export class DisastersModule { }
