import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';

import { Repository } from 'typeorm';
import { NewDisastersEntity } from 'src/newDisasters/newDisasters.entity';
import { UserRepository } from 'src/auth/user.repository';

@Injectable()
export class EmailAlertsService {

    /* 노드메일러 라이브러리에서 일종의 브릿지 역할을 하는 Transporter 추출 */
    private transporter: nodemailer.Transporter;

    /* 유저 명단 추출 및 이메일 발송을 위한 Constructor 셋업 */
    constructor(
        private userRepository: UserRepository, // 이메일 대상자 필터링을 위해서 User 테이블도 불러오기

    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ALERT_ID,
                pass: process.env.EMAIL_ALERT_PWD,
            },
        });
    }

    /* newDisasters.service의 handleDisasterUpdate()에서 필요한 이메일 발송 함수 */
    async sendEmailAlert(disaster: NewDisastersEntity) {

        const emailContent = this.createEmailContent(disaster);
        const targetUsers = await this.userRepository.find();

        for (const user of targetUsers) {
            try {
                // 구독 국가가 'all' 이거나, 재난 발생 국가 중 하나에 포함되어 있는지 확인
                const isCountrySubscribed = user.subscriptionCountry1 === 'all' ||
                    user.subscriptionCountry2 === 'all' ||
                    user.subscriptionCountry3 === 'all' ||
                    user.subscriptionCountry1 === disaster.dCountry ||
                    user.subscriptionCountry2 === disaster.dCountry ||
                    user.subscriptionCountry3 === disaster.dCountry;

                // 구독 레벨이 문자열 'true'인지 확인하고 재난 경보 레벨과 일치하는지 확인
                const isAlertLevelMatched = (disaster.dAlertLevel === 'Green' && user.subscriptionLevel_Green === 'true') ||
                    (disaster.dAlertLevel === 'Orange' && user.subscriptionLevel_Orange === 'true') ||
                    (disaster.dAlertLevel === 'Red' && user.subscriptionLevel_Red === 'true');

                // 조건을 만족하는 경우에만 이메일 전송
                if (isCountrySubscribed && isAlertLevelMatched) {
                    await this.sendMail(
                        user.email, // 이메일 받는이
                        `Alert: ${disaster.dTitle}`, // 이메일 제목
                        disaster.dDescription, // text 내용물 (모든 이메일이 html을 렌더하지 않으니)
                        emailContent // html 내용물 (cc. createEmailContent)
                    );
                    console.log(`Email sent to: ${user.email}`);
                }
            } catch (error) {
                console.error(`Error sending email to ${user.email}: `, error);
            }
        }
    }

    private createEmailContent(disaster: NewDisastersEntity): string {
        // 고객 알림 이메일을 전송하기 위해 필요한 HTML 생성 함수 (보조 함수)

        const emailHtml = `
            <h1>New Disaster Alert: ${disaster.dTitle}</h1>
            <p>${disaster.dDescription}</p>
            <p>This disaster happened within the alerts parameter you designated through our platform. For more details, visit the following link:</p>
            <a href="https://worldisaster.com/earth?lon=${disaster.dLongitude}&lat=${disaster.dLatitude}&height=500000&did=${disaster.dID}"> Worldisaster Website (Recommended) </a>
        `;

        return emailHtml;
    }

    /* 실제 transporter를 통해서 이메일을 보내는 함수 */
    private async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {

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


