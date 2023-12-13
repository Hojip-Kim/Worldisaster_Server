import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request, Response } from 'express';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: (req) => {
                const cookie = req.cookies['refresh-token'];
                return cookie;
            },
            secretOrKey: process.env.JWT_SECRET_REFRESH,
            passReqToCallBack: true,
        });
    }

    validate(payload: JwtPayload) {
        // const refreshToken = req.get('authorization').split('Bearer ')[1];
        // console.log(payload);

        return {
            email: payload.email,
            id: payload.sub,
        };
    }
}