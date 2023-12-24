import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { User } from './user.entity';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,

        private configService: ConfigService
    ){
        super({
            secretOrKey: configService.get<string>('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }



    async validate(payload){
        const {username} = payload;
        const user: User = await this.userRepository.findOneBy({ username });

        if(!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}