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

}
