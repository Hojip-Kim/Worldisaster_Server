import { Controller, Get, Post, Req, Res, Query, UseGuards, Body } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { Request, Response } from 'express';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from 'src/auth/dto/googleUser.dto';
import { NewDisastersService } from 'src/newDisasters/newDisasters.service';

interface CustomRequest extends Request {
    user?: GoogleUser;
}

@Controller('support')
export class PayPalController {
    constructor(private readonly paypalService: PayPalService, private readonly disastersService: NewDisastersService) { }


    @UseGuards(AuthGuard('jwt-access'))
    @Get('/')
    async getUrgentDisasters(@Res() res: Response) {
        try {
            const disasters = await this.disastersService.getUrgentDisasters();
            console.log(disasters);
            res.json(disasters);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    @UseGuards(AuthGuard('jwt-access'))
    @Post('paypal')
    async createPayment(@Res() res: Response, @Body() body: any) {
        // body에는 amount, dId가 들어있음.
        const amount = body.amount;
        const dId = body.dId;

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "https://worldisaster.com/api/support/success",
                "cancel_url": "https://worldisaster.com/api/support/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Donate to Worldisaster",
                        "sku": "001",
                        "price": '10.00',
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": '10.00'
                },
                "description": "Hat for the best team ever"
            }]
        };

        try {
            const payment = await this.paypalService.createPayment(create_payment_json);
            const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
            if (approvalUrl) {
                res.json({ approvalUrl: approvalUrl.href });
            }
        } catch (error) {
            console.error(error);
            res.send('Payment creation failed');
        }
    }

    @Get('success')
    async executePayment(@Query('PayerID') payerId: string, @Query('paymentId') paymentId: string, @Res() res: Response) {
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{ "amount": { "currency": "USD", "total": "10.00" } }]
        };

        try {
            const payment = await this.paypalService.executePayment(paymentId, execute_payment_json);
            console.log(JSON.stringify(payment));
            console.log(payment);
            res.send('Success');
        } catch (error) {
            console.error(error);
            res.send('Payment execution failed');
        }
    }

    @Get('cancel')
    cancelPayment(@Res() res: Response) {
        res.send('Cancelled');
        res.redirect('https://worldisaster.com/support');
    }


}
