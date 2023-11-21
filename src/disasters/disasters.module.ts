import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryMappings } from 'src/country/script_init/country-table.entity';
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
    TypeOrmModule.forFeature([CountryMappings]),
  ],
  providers: [DisastersService],
  controllers: [DisastersController]
})
export class DisastersModule { }
