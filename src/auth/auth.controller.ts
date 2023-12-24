import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, Res, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleUser } from './dto/googleUser.dto';
import { JwtService } from '@nestjs/jwt';



export interface JwtPayload {
    sub: string;
    email: string;
}

export interface CustomRequest extends Request {
    user?: GoogleUser;

}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private jwtService: JwtService) { }


    @Get('/')
    @UseGuards(AuthGuard('jwt-access'))
    async getInfo(@Req() req: CustomRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('No user from Google');
        }

        console.log('\nAPI : GET call made to fetch user details');

        const { email } = req.user;
        const user = this.authService.findUserByEmail(email);
        res.json({ name: (await user).name, email: (await user).email, provider: (await user).provider });
    }


    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(): Promise<void> {
    }

    @Get('/google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {
        if (!req.user) {
            throw new UnauthorizedException('No user from Google');
        }

        const twoHours = 1000 * 60 * 60 * 2; // expires 2시간
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

        await this.authService.updateHashedRefreshToken(user.id, refreshToken);

        res.redirect('https://worldisaster.com/earth');
    }

    @UseGuards(AuthGuard('jwt-access'))
    @Get('/logout')
    async logout(@Req() req: CustomRequest, @Res() res: Response) {

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


        console.log('\nAPI : GET call made to fetch user authentication data');

        const { email } = req.user;

        const user = this.authService.findUserByEmail(email);

        const cleanedName = (await user).name.replace('undefined', '');

        return res.json({ name: cleanedName, email: (await user).email, greenAlert: (await user).subscriptionLevel_Green, orangeAlert: (await user).subscriptionLevel_Orange, redAlert: (await user).subscriptionLevel_Red, nation1: (await user).subscriptionCountry1, nation2: (await user).subscriptionCountry2, nation3: (await user).subscriptionCountry3 });

    }


    //유저 구독 Post 메서드 (이메일 알림)
    @UseGuards(AuthGuard('jwt-access'))
    @Post('info')
    async subscribe(@Req() req: CustomRequest, @Res() res: Response) {
        const { email } = req.user;
        const { greenAlert, orangeAlert, redAlert, nation1, nation2, nation3 } = req.body

        try {
            const user = await this.authService.findUserByEmail(email);

            if (!user) {
                throw new Error('User not found');
            }

            user.subscriptionLevel_Green = greenAlert;
            user.subscriptionLevel_Orange = orangeAlert;
            user.subscriptionLevel_Red = redAlert;
            if (nation1 === 'all' || nation2 === 'all' || nation3 === 'all') {
                user.subscriptionCountry1 = 'all';
                user.subscriptionCountry2 = 'all';
                user.subscriptionCountry3 = 'all';
            } else {
                user.subscriptionCountry1 = nation1;
                user.subscriptionCountry2 = nation2;
                user.subscriptionCountry3 = nation3;
            }

            await this.authService.updateUser(user);
            // console.log(req.body);
            res.status(200).json({ success: true, greenAlert: (await user).subscriptionLevel_Green, orangeAlert: (await user).subscriptionLevel_Orange, redAlert: (await user).subscriptionLevel_Red, nation1: (await user).subscriptionCountry1, nation2: (await user).subscriptionCountry2, nation3: (await user).subscriptionCountry3 });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }

    }

    @UseGuards(AuthGuard('jwt-access'))
    @Post('delete')
    async deleteUser(@Req() req: CustomRequest, @Res() res: Response) {
        const { email } = req.user
        const user = await this.authService.findUserByEmail(email);


        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        try {
            await this.authService.deleteUserByEmail(email);
            console.log(user.name + ' 탈퇴 완료');
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

            // 사용자 삭제가 성공적으로 완료된 후 리다이렉트
            return res.status(200).json({ name: user.name, redirectUrl: 'https://worldisaster.com' });
        } catch (error) {
            console.error(error);
            // 오류가 발생한 경우 에러 메시지를 JSON 형식으로 응답
            return res.status(500).json({ message: 'Error deleting user' });
        }
    }

}
