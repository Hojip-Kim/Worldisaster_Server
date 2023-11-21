import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DonateModule } from './donate/donate.module';
import { ScheduleModule } from '@nestjs/schedule';

import { DisastersModule } from './disasters/disasters.module';
import { CountryModule } from './country/country.module';





@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeORMConfig), ScheduleModule.forRoot(),
    AuthModule, DonateModule, DisastersModule,
    CountryModule,],
})


export class AppModule { }