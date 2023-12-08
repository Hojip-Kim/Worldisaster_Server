import { Controller, Get, Post, Req, Res, Query, UseGuards, Body } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { Request, Response } from 'express';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from 'src/auth/dto/googleUser.dto';
import { NewDisastersService } from 'src/newDisasters/newDisasters.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { AuthService } from 'src/auth/auth.service';

interface CustomRequest extends Request {
  user?: GoogleUser;
}

@Controller('support')
export class PayPalController {
  constructor(private readonly paypalService: PayPalService, private readonly disastersService: NewDisastersService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private authService: AuthService) { }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('/')
  async getUrgentDisasters(@Res() res: Response) {
    try {
      const disasters = await this.disastersService.getUrgentDisasters();
      res.json(disasters);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


  @UseGuards(AuthGuard('jwt-access'))
  @Post('paypal')
  async createPayment(@Req() req: CustomRequest, @Res() res: Response, @Body() body: any) {
    console.log(body);
    const { amount, dID, currency } = body;
    const { email } = req.user;

    console.log(dID);

    try {
      const user = await this.authService.findUserByEmail(email);
      const disaster = await this.disastersService.findDisasterByID(dID);

      if (!user) {
        throw new Error('User not found');
      }

      const create_payment_json = {
        "intent": "sale",
        "payer": { "payment_method": "paypal" },
        "redirect_urls": {
          "return_url": "https://worldisaster.com/api/support/success",
          "cancel_url": "https://worldisaster.com/api/support/cancel"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": disaster.dTitle,
              "sku": "001",
              "price": amount,
              "currency": currency,
              "quantity": 1
            }]
          },
          "amount": {
            "currency": currency,
            "total": amount
          },
          "description": disaster.dDescription
        }]
      };

      const payment = await this.paypalService.createPayment(create_payment_json);
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');

      if (approvalUrl) {
        const newPayment = this.paymentRepository.create({
          dId: dID,
          useremail: email,
          username: user.name,
          country: disaster.dCountry,
          amount: amount,
          status: 'pending',
          currency: currency,
          paymentId: payment.id,
        });

        await this.paymentRepository.save(newPayment);
        res.json({ approvalUrl: approvalUrl.href });
      } else {
        throw new Error('No approval URL found in payment response');
      }
    } catch (error) {
      console.error('Error in createPayment:', error);
      res.status(500).json({ success: false, message: error.message || 'Payment creation failed' });
    }
  }

  @Get('success')
  async executePayment(@Query('PayerID') payerId: string, @Query('paymentId') paymentId: string, @Res() res: Response) {
    const existingPayment = await this.paymentRepository.findOneBy({
      paymentId: paymentId
    });
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{ "amount": { "currency": existingPayment.currency, "total": existingPayment.amount.toString() } }]
    };

    try {
      const payment = await this.paypalService.executePayment(paymentId, execute_payment_json);

      const transactionId = payment.transactions[0].related_resources[0].sale.id;


      if (existingPayment) {
        // Payment 엔티티 업데이트
        existingPayment.payerId = payerId;
        existingPayment.transactionId = transactionId;
        existingPayment.status = 'completed'; // 상태를 'completed'로 업데이트

        await this.paymentRepository.save(existingPayment); // 업데이트된 Payment 저장
      } else {
        throw new Error('Payment not found');
      }

      res.redirect('https://worldisaster.com/support');

    } catch (error) {
      console.error(error);
      res.send('Payment execution failed');
    }
  }

  @Get('cancel')
  cancelPayment(@Res() res: Response) {
    res.send('Cancelled');
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('history')
  async getHistory(@Req() req: CustomRequest, @Res() res: Response) {
    const { email } = req.user;
    const history = await this.paymentRepository.find({ where: { useremail: email, status: 'completed' } });
      const historyWithDisasterDetails = await Promise.all(history.map(async (payment) => {
      const disaster = await this.disastersService.findDisasterByID(payment.dId);
      return {
        email: payment.useremail,
        name: payment.username,
        amount: payment.amount,
        currency: payment.currency,
        targetCountry: payment.country,
        dTitle: disaster.dTitle,
        dID: disaster.dID,
        dType: disaster.dType,
        dAlertLevel: disaster.dAlertLevel,
      };
    }));

    return res.json(historyWithDisasterDetails);

  }

}
