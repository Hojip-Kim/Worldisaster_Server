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


        return res.json({ name: cleanedName, email: (await user).email, });

    }

    // @Post('/signup')
    // signUp(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto): Promise<User> {
    //     return this.authService.signUp(authcredentialsDto);
    // }

    // /* Soft Delete 고려할것. */
    // @Delete('/delete')
    // @UseGuards(AuthGuard())
    // deleteUser(@GetUser() user: User): Promise<any> {
    //     console.log('user', user);
    // return this.authService.deleteUser(user);
    // }
    // @Post('/signin')
    // signIn(@Body(ValidationPipe) authcredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
    //     return this.authService.signIn(authcredentialsDto);
    // }

    // @Post('/test')
    // @UseGuards(AuthGuard())
    // test(@GetUser() user: User){
    //     console.log('user', user);
    // }

}
