import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { OldDisastersService } from './oldDisasters.service';
import { OldDisastersController } from './oldDisasters.controller';
import { OldDisastersEntity } from './oldDisasters.entity';
import { LiveNewsEntity } from '../liveNews/liveNews.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([OldDisastersEntity, CountryMappings]),
  ],
  providers: [OldDisastersService],
  controllers: [OldDisastersController]
})
export class OldDisastersModule { }
