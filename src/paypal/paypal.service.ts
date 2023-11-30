import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    PayPalEnvironment,
    PayPalHttpClient,
    OrdersCreateRequest,
    OrderRequest
} from '@paypal/checkout-server-sdk';

@Injectable()
export class PaypalService {
    private client: PayPalHttpClient;

    constructor(private configService: ConfigService) {
        const clientId = this.configService.get('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get('PAYPAL_SECRET');
        const environment = new PayPalEnvironment.Sandbox(clientId, clientSecret);
        this.client = new PayPalHttpClient(environment);
    }

    async createOrder(amount: string): Promise<string> {
        const request = new OrdersCreateRequest();
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: amount
                }
            }]
        });

        try {
            const response = await this.client.execute(request);
            return response.result.links.find(link => link.rel === 'approve').href;
        } catch (error) {
            throw new Error(`Error creating PayPal order: ${error.message}`);
        }
    }
}