import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAlertsService {

    /* 노드메일러 라이브러리에서 일종의 브릿지 역할을 하는 Transporter 추출 */
    private transporter: nodemailer.Transporter;

    /* 유저 명단 추출 및 이메일 발송을 위한 Constructor 셋업 */
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ALERT_ID,
                pass: process.env.EMAIL_ALERT_PWD,
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {

        const mailOptions = {
            from: `"Worldisaster Alert System" <${process.env.EMAIL_ALERT_ID}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}
