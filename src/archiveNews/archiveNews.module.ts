import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';


import { ArchiveNewsEntity } from './archiveNews.entity';
import { ArchiveNewsService } from './archiveNews.service';
import { ArchiveNewsController } from './archiveNews.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ArchiveNewsEntity]),
  ],
  providers: [ArchiveNewsService],
  controllers: [ArchiveNewsController]
})
export class ArchiveNewsModule { }