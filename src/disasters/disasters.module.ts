import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { DisastersService } from './disasters.service';
import { DisastersController } from './disasters.controller';
import { DisastersList } from './disasters-list.entity';
import { DisastersDetailEntity } from './disasters-detail.entity';
import { LiveArticleEntity } from './liveNews.entity';
import { Type } from 'class-transformer';
import { NYTArchiveEntity } from './archive_news.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      DisastersList, 
      DisastersDetailEntity, 
      NYTArchiveEntity, 
      CountryMappings, 
      LiveArticleEntity
    ]),
  ],
  providers: [DisastersService],
  controllers: [DisastersController]
})
export class DisastersModule { }