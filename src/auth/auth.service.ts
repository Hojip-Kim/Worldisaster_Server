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
    ){}

    async findByProviderIdOrSave(googleUser: GoogleUser): Promise<User> {
        const { providerId, provider, email, name} = googleUser;

        let user = await this.userRepository.findOneBy({ providerId });

        if(!user){
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

        return { accessToken, refreshToken};
    }

    async updateHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const salt = await bcrypt.genSalt();
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        await this.userRepository.update(userId, {
            hashedRefreshToken: hashedRefreshToken,
        });
    }

    // async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    //     return this.userRepository.createUser(authCredentialsDto);
    // }

    // async deleteUser(user: User): Promise<any> {
    //     console.log('user', user);
    //     const result = await this.userRepository.delete(user.id);

    //     if(result.affected === 0){
    //         throw new NotFoundException(`Cant find Board with id ${user.id}`);
    //     }

    //     return {
    //         statusCode: HttpStatus.OK,
    //         message: `User with id ${user.id} successfully deleted.`
    //     };
    // }

    // async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
    //     const { username, password } = authCredentialsDto;
    //     const user = await this.userRepository.findOneBy({username});

    //     if(user && (await bcrypt.compare(password, user.password))){
    //         //유저 토큰 생성 (Secret + Payload)
    //         const payload = { username };
    //         const accessToken = await this.jwtService.sign(payload);

    //         return { accessToken: accessToken };
    //     }else {
    //         throw new UnauthorizedException('Login failed')
    //     }
    // }

}
