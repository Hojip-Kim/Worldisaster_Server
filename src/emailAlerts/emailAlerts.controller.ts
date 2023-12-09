import { Controller, Get, Post, Body, Req, Param, Delete, UsePipes, ValidationPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { CustomRequest } from 'src/auth/auth.controller';

import { EmailAlertsService } from './emailAlerts.service';
import { CreateEmailAlertDto } from './dto/emailAlerts.dto';

@Controller('emailAlerts')
export class EmailAlertsController {
    constructor(private readonly emailAlertsService: EmailAlertsService,
        private readonly authService: AuthService) { }

    /* 특정 유저의 이메일 알림을 받기 위한 GET API */
    @Get('/')
    @UseGuards(AuthGuard('jwt-access'))
    async getEmailAlerts(@Req() req: CustomRequest) {
        const { email } = req.user;
        const user = await this.authService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log(`\nAPI : GET call made to fetch all alert values for ${email}`);
        return this.emailAlertsService.getEmailAlerts(email);
    }

    /* 특정 유저의 이메일 알림을 새로 생성하는 POST API */
    @Post('/')
    @UseGuards(AuthGuard('jwt-access'))
    @UsePipes(new ValidationPipe({ transform: true }))
    async createEmailAlert(@Req() req: CustomRequest, @Body() createEmailAlertDto: CreateEmailAlertDto) {
        const { email } = req.user;
        console.log('Raw Body:', req.body); // Log the raw body
        console.log('DTO:', createEmailAlertDto); // Log the DTO

        const user = await this.authService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log(`\nAPI : POST call made to create new alert for ${email}`);
        return this.emailAlertsService.createEmailAlert(email, createEmailAlertDto);
    }

    /* 특정 유저의 단일 알림을 삭제하는 DELETE API */
    @Delete('/:objectId')
    @UseGuards(AuthGuard('jwt-access'))
    async deleteEmailAlert(@Req() req: CustomRequest, @Param('objectId') objectId: number) {
        const { email } = req.user;
        const user = await this.authService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log(`\nAPI : DELETE call made to delete one alert for ${email}`);
        await this.emailAlertsService.deleteEmailAlerts(objectId, email);
    }

    /* 특정 유저의 모든 알림을 삭제하는 DELETE API */
    @Delete('/')
    @UseGuards(AuthGuard('jwt-access'))
    async deleteAllAlerts(@Req() req: CustomRequest) {
        const { email } = req.user;
        const user = await this.authService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        console.log(`\nAPI : DELETE call made to delete all alerts for ${email}`);
        return this.emailAlertsService.deleteAllAlerts(email);
    }
}
