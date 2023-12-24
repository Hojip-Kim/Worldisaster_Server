import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { Strategy, ExtractJwt } from 'passport-jwt';

require('dotenv').config()

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt-access') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
    }
    async validate(payload: JwtPayload) {
        return {
            email: payload.email,
            id: payload.sub,
        };
    }
}