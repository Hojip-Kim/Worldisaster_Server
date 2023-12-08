import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.controller';

interface GoogleUser {
    provider: string;
    providerId: string;
    email: string;
    name: string;
}

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) { }

    async findByProviderIdOrSave(googleUser: GoogleUser): Promise<User> {
        const { providerId, provider, email, name } = googleUser;

        let user = await this.userRepository.findOneBy({ providerId });

        if (!user) {
            user = this.userRepository.create({
                provider,
                providerId,
                email,
                name
            });
            await this.userRepository.save(user);
        }
        return user;
    }

    getToken(payload: JwtPayload) {
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '2h',
            secret: process.env.JWT_SECRET,
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET,
        })

        return { accessToken, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<string> {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_SECRET_REFRESH,
            });

            const payload = {
                sub: decoded.sub,
                email: decoded.email
            };
            return this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '2h', // 2시간
            });

        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }


    async updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const salt = await bcrypt.genSalt();
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        await this.userRepository.update(userId, {
            hashedRefreshToken: hashedRefreshToken,
        });
    }

    async revokeToken(id: string): Promise<void> {
        await this.userRepository.update(id, { hashedRefreshToken: null })
    }

    async findUserByEmail(email: string) {
        const user = await this.userRepository.findOneBy({ email });
        console.log(user);
        return user;
    }

    async updateUser(user: User): Promise<User> {
        return this.userRepository.save(user);
    }

    async deleteUserByEmail(email: string): Promise<void> {
        // 데이터베이스나 ORM을 사용하여 해당 이메일의 사용자를 삭제
        // 예를 들어 TypeORM을 사용한다면 다음과 같이 작성할 수 있습니다.
        await this.userRepository.delete({ email });
    }

    createGoogleOAuthURL(preLoginUrl: string): string {
        const clientID = process.env.GOOGLE_CLIENT_ID;
        const redirectURI = process.env.GOOGLE_CALLBACK_URL;
        const scope = 'email profile'; // 필요한 스코프 지정

        // state 파라미터에 preLoginUrl 저장
        const state = encodeURIComponent(preLoginUrl);

        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${state}`;
    }

}
