import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Res, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleUser } from './dto/googleUser.dto';


export interface JwtPayload {
    sub: string;
    email: string;
}

interface CustomRequest extends Request {
    user?: GoogleUser;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(): Promise<void> { }

    @Get('/google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: CustomRequest, @Res() res: Response) {

        if (!req.user) {
            throw new UnauthorizedException('No user from Google');
        }

        const user = await this.authService.findByProviderIdOrSave(req.user as GoogleUser);
        const payload: JwtPayload = { sub: user.id, email: user.email }

        const { accessToken, refreshToken } = this.authService.getToken(payload);

        await res.cookie('access-token', accessToken, {
            domain: 'worldisaster.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        await res.cookie('refresh-token', refreshToken, {
            domain: 'worldisaster.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });

        await this.authService.updateHashedRefreshToken(user.id, refreshToken);

        res.redirect('https://worldisaster.com/');

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
