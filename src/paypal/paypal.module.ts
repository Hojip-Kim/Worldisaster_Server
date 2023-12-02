import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { NewDisastersService } from 'src/newDisasters/newDisasters.service';
import { NewDisastersModule } from 'src/newDisasters/newDisasters.module';

@Module({
    imports: [NewDisastersModule],
    controllers: [PayPalController],
    providers: [PayPalService],
})
export class PayPalModule {}
