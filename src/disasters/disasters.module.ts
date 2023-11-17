import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { DisastersService } from './disasters.service';
import { DisastersController } from './disasters.controller';
import { DisastersList } from './disasters-list.entity';
import { DisastersDetailEntity } from './disasters-detail.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([DisastersList]),
    TypeOrmModule.forFeature([DisastersDetailEntity]),
  ],
  providers: [DisastersService],
  controllers: [DisastersController]
})
export class DisastersModule { }