import { Module } from '@nestjs/common';
import { DonateService } from './donate.service';
import { DonateController } from './donate.controller';

@Module({
    controllers: [DonateController],
    providers: [DonateService],
})
export class DonateModule { }
