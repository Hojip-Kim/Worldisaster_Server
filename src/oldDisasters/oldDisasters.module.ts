import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { OldDisastersService } from './oldDisasters.service';
import { OldDisastersController } from './oldDisasters.controller';
import { OldDisastersList } from './oldDisasters-list.entity';
import { OldDisastersEntity } from './oldDisasters.entity';
import { Type } from 'class-transformer';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([OldDisastersList]),
    TypeOrmModule.forFeature([OldDisastersEntity]),
    TypeOrmModule.forFeature([CountryMappings]),
  ],
  providers: [OldDisastersService],
  controllers: [OldDisastersController]
})
export class OldDisastersModule { }
