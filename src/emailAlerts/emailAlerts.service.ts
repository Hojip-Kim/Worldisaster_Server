import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';

import { EmailAlertsEntity } from './emailAlerts.entity';
import { CreateEmailAlertDto } from './dto/emailAlerts.dto';
import { NewDisastersEntity } from 'src/newDisasters/newDisasters.entity';

@Injectable()
export class EmailAlertsService {

    /* 노드메일러 라이브러리에서 일종의 브릿지 역할을 하는 Transporter 추출 */
    private transporter: nodemailer.Transporter;

    /* 유저 명단 추출 및 이메일 발송을 위한 Constructor 셋업 */
    constructor(

        @InjectRepository(EmailAlertsEntity) // emailAlertsEntity 테이블 접근하기
        private emailAlertsRepository: Repository<EmailAlertsEntity>,

    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ALERT_ID,
                pass: process.env.EMAIL_ALERT_PWD,
            },
        });
    }

    /* 알림 조회를 위한 API 함수, */
    async getEmailAlerts(userEmail: string): Promise<EmailAlertsEntity[]> {

        return this.emailAlertsRepository.find({
            where: { alertEmail: userEmail },
            order: { createdAt: 'DESC' }
        });
    }

    /* 알림 생성을 위한 API 함수 */
    async createEmailAlert(userEmail: string, createEmailAlertDto: CreateEmailAlertDto): Promise<EmailAlertsEntity> {

        const alertEmail = userEmail;
        const {
            alertCountryName,
            alertDistrictName,
            alertLatitude,
            alertLongitude,
            alertRadius,
            alertLevelGreen,
            alertLevelOrange,
            alertLevelRed } = createEmailAlertDto;
        const {
            alertLatitudeMax,
            alertLatitudeMin,
            alertLongitudeMax,
            alertLongitudeMin } = this.calculateBounds(alertLatitude, alertLongitude, alertRadius);

        const emailAlert = this.emailAlertsRepository.create({
            alertEmail,
            alertCountryName,
            alertDistrictName,
            alertLatitude,
            alertLongitude,
            alertRadius,
            alertLevelGreen,
            alertLevelOrange,
            alertLevelRed,
            alertLatitudeMax,
            alertLatitudeMin,
            alertLongitudeMax,
            alertLongitudeMin
        }); // objectId만 TypeORM에서 자동 생성

        return this.emailAlertsRepository.save(emailAlert);
    }

    private calculateBounds(lat: number, lon: number, dist: number): any {
        // 알림 생성을 위한 보조함수 (위도경도 최대값 계산)

        // 지구의 둘레는 40,075km이라고 함
        // 지구 중심을 기준으로 360도를 생각했을 때, 1도 벌어졌을때의 거리는 대강 111.32km
        // 따라서 입력값으로 주어진 거리를 111.32로 나누면 해당 거리로 인해서 벌어지는 위도 경도(지구 중심에서부터 각도)를 역산 가능
        const distInDegree = dist / 111.32; // 

        // 위도는 지구 중심과 적도를 기준으로 위/아랫값이며, 적도에서부터 평행하게 위 아래로 움직임 (토마토 얇게 썰기)
        // 따라서 각도당 거리를 활용하면 단순 덧셈 뻴셈으로 대략적인 위도 상/하한선을 추산할 수 있음
        const alertLatitudeMax = lat + distInDegree;
        const alertLatitudeMin = lat - distInDegree;

        // 경도는 적도와 수직이며, 북극과 남극에서 모든 경도들이 모인다고 보면 됨 (사과 조각으로 자르기)
        // 따라서 경도 값이 적도에 가까울수록 위도처럼 단순 distInDegree를 더하고 빼면 되는데, 
        // 반대로 북극/남극에 가까워질수록 경도 1도가 상징하는 둘레 길이가 줄어들 수 밖에 없음
        // 정확히는, 우리가 검토하는 특정 위치의 위도에 따라서 경도에서의 1도 움직임이 상징하는 둘레 길이가 줄어드는 것
        // 따라서 해당 위치의 위도를 호도법으로 Radian으로 변경한 뒤 (Radian = 각도 x pie / 180), 
        // 코사인을 적용 (코사인 0 = 1 ; 코사인 90 = 0 -> https://m.blog.naver.com/a7343/222008990258)
        // 위도가 0도이면 사실상 적도이며, 0도는 호도법 적용해도 0이고, 코사인에 넣으면 1을 반환 (distInDegree 거의 그대로 적용)
        // 반대로 위도가 90이면 북극이며, 90은 호도법 적용시 1.57이고, 코사인에 넣으면 0에 아주 근접 (distInDegree를 거의 무한대로 만듬)
        // 위도가 -90일 경우에도 호도법 적용시 1.57이며, 코사인은 마이너스 값을 넣어도 동일한 값을 출력
        // 문제는, distInDegree/0 을 하게되면 값이 사실상 계산이 불가능해짐 -> 이러한 계산법의 한계
        // 따라서 경도 값이 -70 ~ 70을 벗어난다면, 알림 설정을 막거나 geospatial API 밖에 방법이 없음
        // 하나의 재난마다 모든 알림들을 API에 적용해서 호출하는 것은 말이 안되니, 알림 설정을 막아야 함
        const latInRadians = lat * (Math.PI / 180);
        const alertLongitudeMax = lon + distInDegree / Math.cos(latInRadians);
        const alertLongitudeMin = lon - distInDegree / Math.cos(latInRadians);

        return { alertLatitudeMax, alertLatitudeMin, alertLongitudeMax, alertLongitudeMin };
    }

    /* 알림 삭제를 위한 API 함수 */
    async deleteEmailAlerts(objectId: number, userEmail: string): Promise<void> {
        await this.emailAlertsRepository.delete({ objectId, alertEmail: userEmail });
    }

    /* 모든 알림을 삭제하는 API 함수 */
    async deleteAllAlerts(userEmail: string): Promise<void> {
        await this.emailAlertsRepository.delete({ alertEmail: userEmail });
    }

    /* newDisasters.service의 handleDisasterUpdate()에서 필요한 이메일 발송 함수 */
    async sendEmailAlert(disaster: NewDisastersEntity) {

        const emailContent = this.createEmailContent(disaster);
        const alertEntries = await this.emailAlertsRepository.find();
        const bccEmailAddresses = [];

        // 모든 알림을 가져와서, max/min 위도 경도를 비교
        for (const entry of alertEntries) {
            try {
                const isValidBoundary =
                    disaster.dLatitude >= entry.alertLatitudeMin &&
                    disaster.dLatitude <= entry.alertLatitudeMax &&
                    disaster.dLongitude >= entry.alertLongitudeMin &&
                    disaster.dLongitude <= entry.alertLongitudeMax;

                const isAlertLevelMatched =
                    (disaster.dAlertLevel === 'Green' && entry.alertLevelGreen) ||
                    (disaster.dAlertLevel === 'Orange' && entry.alertLevelOrange) ||
                    (disaster.dAlertLevel === 'Red' && entry.alertLevelRed);

                if (isValidBoundary && isAlertLevelMatched) {
                    bccEmailAddresses.push(entry.alertEmail);
                }

            } catch (error) {
                console.error(`Error processing alert entry for email ${entry.alertEmail}: `, error);
            }
        }

        // 한번에 단체로 BCC 이메일 보내기 (To는 비어있음))
        if (bccEmailAddresses.length > 0) {
            console.log(`Email attempt at ${bccEmailAddresses.length} users`)
            const uniqueEmailAddresses = new Set(bccEmailAddresses);
            await this.sendBatchMail(Array.from(uniqueEmailAddresses), `Alert: ${disaster.dTitle}`, disaster.dDescription, emailContent);
            console.log(`Email sent to ${uniqueEmailAddresses.size} users (remove duplicates)`);
        }
    }

    private createEmailContent(disaster: NewDisastersEntity): string {
        // 고객 알림 이메일을 전송하기 위해 필요한 HTML 생성 함수 (보조 함수)

        const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    border: 1px solid #ddd;
                    padding: 20px;
                    text-align: center;
                }
                .email-header {
                    background-color: #f2f2f2;
                    color: #333;
                    padding: 10px;
                    font-size: 24px;
                    text-align: center;
                }
                .email-body {
                    margin: 20px 0;
                    text-align: left;
                }
                .email-footer {
                    background-color: #f2f2f2;
                    padding: 10px;
                    font-size: 14px;
                    text-align: center;
                }
                .email-button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin: 20px 0;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    Disaster Alert: ${disaster.dTitle}
                </div>
                <div class="email-body">
                    <p>${disaster.dDescription}</p>
                    <p>This disaster occurred within the geographical parameters you set in our alert system.</p>
                    <a href="https://worldisaster.com/earth?lon=${disaster.dLongitude}&lat=${disaster.dLatitude}&height=500000&did=${disaster.dID}" class="email-button">Visit for More Details</a>
                </div>
                <div class="email-footer">
                    <p>Stay safe and informed,</p>
                    <p>The Worldisaster Team</p>
                </div>
            </div>
        </body>
        </html>
        `;

        return emailHtml;
    }

    /* 실제 transporter를 통해서 이메일을 보내는 함수 */
    private async sendBatchMail(bcc: string[], subject: string, text: string, html: string): Promise<void> {
        const mailOptions = {
            from: `"Worldisaster Alert System" <${process.env.EMAIL_ALERT_ID}>`,
            bcc: bcc,
            subject: subject,
            text: text,
            html: html,
        };

        await this.transporter.sendMail(mailOptions);
    }
}


