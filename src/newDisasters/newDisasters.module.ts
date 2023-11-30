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

@Module({
  imports: [
    HttpModule, AuthModule, EmailAlertsModule,
    TypeOrmModule.forFeature([NewDisastersEntity]),
    TypeOrmModule.forFeature([CountryMappings]),
  ],
  controllers: [NewDisastersController],
  providers: [NewDisastersService, NewDisastersGateway]
})
export class NewDisastersModule { }
