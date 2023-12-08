import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailAlertsController } from './emailAlerts.controller';
import { EmailAlertsService } from './emailAlerts.service';
import { EmailAlertsEntity } from './emailAlerts.entity';

import { AuthModule } from 'src/auth/auth.module';
import { NewDisastersEntity } from 'src/newDisasters/newDisasters.entity';

@Module({
  imports: [
    AuthModule, // userRepository가 이미 AuthModule에서 제공되니 필요 없음
    TypeOrmModule.forFeature([EmailAlertsEntity]),
  ],
  controllers: [EmailAlertsController],
  providers: [EmailAlertsService],
  exports: [EmailAlertsService]
})
export class EmailAlertsModule { }
