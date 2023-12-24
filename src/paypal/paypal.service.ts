import { Injectable } from '@nestjs/common';
import * as paypal from 'paypal-rest-sdk';

require('dotenv').config()

@Injectable()
export class PayPalService {
  constructor() {
    paypal.configure({
      'mode': 'sandbox', // sandbox or live
      'client_id': process.env.PAYPAL_CLIENT_ID,
      'client_secret': process.env.PAYPAL_CLIENT_SECRET,
    });
  }

  createPayment(create_payment_json: any): Promise<any> {
    return new Promise((resolve, reject) => {
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }

  executePayment(paymentId: string, execute_payment_json: any): Promise<any> {
    return new Promise((resolve, reject) => {
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
          reject(error);
        } else {
          resolve(payment);
        }
      });
    });
  }
}
