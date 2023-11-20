import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DisastersModule } from './disasters/disasters.module';
import { DisastersList } from './disasters/disasters-list.entity';
import { DisastersDetailEntity } from './disasters/disasters-detail.entity';

import { CountryModule } from './country/country.module';
import { CountryEntity } from './country/country.entity';
import { CountryMappings } from './country/script_init/country-table.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Cron, Scheduled 업데이트를 위함
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'namamu',
      password: 'wjdrmf12#$',
      database: 'db_localhost',
      entities: [
        DisastersList,
        DisastersDetailEntity,
        CountryEntity,
        CountryMappings,
      ],
      synchronize: true,
      // logging: true,
      // synchronize: false, 
      // migrations: ["src/migrations"],
    }),
    DisastersModule,
    CountryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }