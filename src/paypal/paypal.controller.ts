import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Controller('paypal')
export class PaypalController {
    constructor(private readonly paypalService: PaypalService) { }

    @Post('create-order')
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Body('amount') amount: string): Promise<string> {
        return this.paypalService.createOrder(amount);
    }
}