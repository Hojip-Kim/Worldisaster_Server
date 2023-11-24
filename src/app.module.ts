import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { OldDisastersModule } from './oldDisasters/oldDisasters.module';
import { OldDisastersEntity } from './oldDisasters/oldDisasters.entity';

import { CountryModule } from './country/country.module';
import { CountryEntity } from './country/country.entity';
import { CountryMappings } from './country/script_init/country-table.entity';

import { ChatModule } from './chat/chat.module';
import { ChatEntity } from './chat/chat.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Cron, Scheduled 업데이트를 위함
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      // username: 'jungle',
      // password: 'wjdrmf!@#$',
      // database: 'db_test',
      username: 'namamu',
      password: 'wjdrmf12#$',
      database: 'db_localhost',
      entities: [
        OldDisastersEntity,
        CountryEntity,
        CountryMappings,
        ChatEntity,
      ],
      synchronize: true,
      // logging: true,
      // synchronize: false, 
      // migrations: ["src/migrations"],
    }),
    OldDisastersModule,
    CountryModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }