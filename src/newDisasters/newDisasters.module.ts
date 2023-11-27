import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { NewDisastersController } from './newDisasters.controller';
import { NewDisastersService } from './newDisasters.service';
import { NewDisastersEntity } from './newDisasters.entity';
import { NewDisastersGateway } from './newDisasters.gateway';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([NewDisastersEntity]),
    TypeOrmModule.forFeature([CountryMappings]),
  ],
  controllers: [NewDisastersController],
  providers: [NewDisastersService, NewDisastersGateway]
})
export class NewDisastersModule { }
