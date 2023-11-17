import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { typeOrmConfig } from './configs/typeorm.config';
import { ScheduleModule } from '@nestjs/schedule';

import { CountryModule } from './country/country.module';
import { CountryEntity } from './country/country.entity';
import { CountryMappings } from './country/script_init/country-table.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    UploadModule, CountryModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
