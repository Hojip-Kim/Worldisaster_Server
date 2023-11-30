import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryEntity } from './country.entity';
import { CountryMappings } from './script_init/country-table.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([CountryEntity]),
    TypeOrmModule.forFeature([CountryMappings]),
  ],
  providers: [CountryService],
  controllers: [CountryController]
})
export class CountryModule { }
