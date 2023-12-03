import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { NewDisastersService } from 'src/newDisasters/newDisasters.service';
import { NewDisastersModule } from 'src/newDisasters/newDisasters.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [NewDisastersModule,
        TypeOrmModule.forFeature([Payment]), AuthModule],
    controllers: [PayPalController],
    providers: [PayPalService],
})
export class PayPalModule {}
