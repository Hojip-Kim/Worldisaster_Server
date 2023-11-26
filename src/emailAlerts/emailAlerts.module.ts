import { Module } from '@nestjs/common';
import { EmailAlertsService } from './emailAlerts.service';

@Module({
  providers: [EmailAlertsService],
  exports: [EmailAlertsService]
})
export class EmailAlertsModule { }
