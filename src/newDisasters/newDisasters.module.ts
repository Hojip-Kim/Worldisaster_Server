import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { CountryMappings } from 'src/country/script_init/country-table.entity';
import { NewDisastersController } from './newDisasters.controller';
import { NewDisastersService } from './newDisasters.service';
import { NewDisastersEntity } from './newDisasters.entity';
import { NewDisastersGateway } from './newDisasters.gateway';

import { AuthModule } from 'src/auth/auth.module';
import { EmailAlertsModule } from 'src/emailAlerts/emailAlerts.module';
import { RedisModule } from 'src/Redis/redis.module';

@Module({
  imports: [
    HttpModule, AuthModule, EmailAlertsModule,
    TypeOrmModule.forFeature([NewDisastersEntity, CountryMappings]), RedisModule
  ],
  controllers: [NewDisastersController],
  providers: [NewDisastersService, NewDisastersGateway],
  exports: [NewDisastersService]
})
export class NewDisastersModule { }
