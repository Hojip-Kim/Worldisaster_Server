import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleUser } from './dto/googleUser.dto';
import { JwtService } from '@nestjs/jwt';


export interface JwtPayload {
    sub: string;
    email: string;
}

interface CustomRequest extends Request {
    user?: GoogleUser;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private jwtService: JwtService) { }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(): Promise<void> { }

    @Get('/google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {

        if (!req.user) {
            throw new UnauthorizedException('No user from Google');
        }

        const twoHours = 1000 * 60 * 60 * 2; // expires 5분
        const expiresTime = new Date(Date.now() + twoHours);


        const user = await this.authService.findByProviderIdOrSave(req.user as GoogleUser);
        const payload: JwtPayload = { sub: user.id, email: user.email }

        const { accessToken, refreshToken } = this.authService.getToken(payload);

        await res.cookie('access-token', accessToken, {
            domain: 'worldisaster.com',
            path: '/',
            secure: true,
            sameSite: 'none',
            expires: expiresTime
        });
        await res.cookie('refresh-token', refreshToken, {
            domain: 'worldisaster.com',
            path: '/',
            secure: true,
            sameSite: 'none'
        });

        await this.authService.updateHashedRefreshToken(user.id, refreshToken);

        res.redirect('https://worldisaster.com/');

    }
    @UseGuards(AuthGuard('jwt-access'))
    @Get('/logout')
    async logout(@Req() req: CustomRequest, @Res() res: Response) {
        // if (!req.user) {
        //     await this.authService.revokeToken(req.user.id);
        // }

        res.clearCookie('access-token', {
            domain: 'worldisaster.com',
            path: '/',
            secure: true,
            sameSite: 'none'
        });
        res.clearCookie('refresh-token', {
            domain: 'worldisaster.com',
            path: '/',
            secure: true,
            sameSite: 'none'
        });

        res.redirect('https://worldisaster.com/');
    }

    @UseGuards(AuthGuard('jwt-access'))
    @Get('Test')
    async test(@Req() req: CustomRequest, @Res() res: Response) {
        console.log('req.user', req.user);
        res.send('test');
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Get('refresh')
    async restoreAccessToken(@Req() req: Request): Promise<{ accessToken: string }> {
        console.log(req.cookies);
        const refreshToken = req.cookies['refresh-token'];
        const accessToken = await this.authService.refreshToken(refreshToken);
        return { accessToken };
    }

    @UseGuards(AuthGuard('jwt-access'))
    @Get('info')
    async getUserInfo(@Req() req: CustomRequest, @Res() res: Response) {
        const { email } = req.user;

        const user = this.authService.findUserByEmail(email);

        const cleanedName = (await user).name.replace('undefined', '');

        return res.json({ name: cleanedName, email: (await user).email, subscription: (await user).subscription, subscriptionLevel_Green: (await user).subscriptionLevel_Green, subscriptionLevel_Orange: (await user).subscriptionLevel_Orange, subscriptionLevel_Red: (await user).subscriptionLevel_Red, subscriptionCountry1: (await user).subscriptionCountry1, subscriptionCountry2: (await user).subscriptionCountry2, subscriptionCountry3: (await user).subscriptionCountry3 });

    }

    // @UseGuards(AuthGuard('jwt-access'))
    // @Get('subscribe')
    // async openSubscribe(@Req() req: CustomRequest, @Res() res: Response) {
    //     const { email } = req.user;

    //     const user = await this.authService.findUserByEmail(email);

    //     return res.json({ subscription: (await user).subscription, subscriptionLevel_Green: (await user).subscriptionLevel_Green, subscriptionLevel_Orange: (await user).subscriptionLevel_Orange, subscriptionLevel_Red: (await user).subscriptionLevel_Red, subscriptionCountry1: (await user).subscriptionCountry1, subscriptionCountry2: (await user).subscriptionCountry2, subscriptionCountry3: (await user).subscriptionCountry3 });
    // }

    // @UseGuards(AuthGuard('jwt-access'))
    // @Get('donate/notSubscribe')
    // async notSubscription(@Req() req: CustomRequest, @Res() res: Response) {
    //     const { email } = req.user;

    //     const user = await this.authService.findUserByEmail(email);

    //     user.subscription = 'off';
    //     await this.authService.updateUser(user);

    //     return res.json({ message: "subscription off successfully!" });
    // }

    // @UseGuards(AuthGuard('jwt-access'))
    // @Get('donate/subscribe')
    // async getSubScription(@Req() req: CustomRequest, @Res() res: Response) {
    //     const { email } = req.user;

    //     const user = await this.authService.findUserByEmail(email);

    //     user.subscription = 'on';
    //     await this.authService.updateUser(user);

    //     return res.json({ subscription: (await user).subscription, subscriptionLevel_Green: (await user).subscriptionLevel_Green, subscriptionLevel_Orange: (await user).subscriptionLevel_Orange, subscriptionLevel_Red: (await user).subscriptionLevel_Red, subscriptionCountry1: (await user).subscriptionCountry1, subscriptionCountry2: (await user).subscriptionCountry2, subscriptionCountry3: (await user).subscriptionCountry3 });
    // }

    //유저 구독 Post 메서드 (이메일 알림)
    @UseGuards(AuthGuard('jwt-access'))
    @Post('info')
    async subscribe(@Req() req: CustomRequest, @Res() res: Response) {
        const { email } = req.user;
        const { subscriptionLevel_Green, subscriptionLevel_Orange, subscriptionLevel_Red, subscriptionCountry1, subscriptionCountry2, subscriptionCountry3 } = req.body

        try {
            const user = await this.authService.findUserByEmail(email);

            if (!user) {
                throw new Error('User not found');
            }

            user.subscriptionLevel_Green = subscriptionLevel_Green;
            user.subscriptionLevel_Orange = subscriptionLevel_Orange;
            user.subscriptionLevel_Red = subscriptionLevel_Red;
            user.subscriptionCountry1 = subscriptionCountry1;
            user.subscriptionCountry2 = subscriptionCountry2;
            user.subscriptionCountry3 = subscriptionCountry3;

            await this.authService.updateUser(user);

            res.status(200).json({ success: true, subscription: (await user).subscription, subscriptionLevel_Green: (await user).subscriptionLevel_Green, subscriptionLevel_Orange: (await user).subscriptionLevel_Orange, subscriptionLevel_Red: (await user).subscriptionLevel_Red, subscriptionCountry1: (await user).subscriptionCountry1, subscriptionCountry2: (await user).subscriptionCountry2, subscriptionCountry3: (await user).subscriptionCountry3 });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }

    }

}
