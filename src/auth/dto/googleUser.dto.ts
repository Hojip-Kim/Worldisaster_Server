import { IsString } from 'class-validator';

export class GoogleUser {
    @IsString()
    id: string;

    @IsString()
    provider: string;

    @IsString()
    providerId: string;

    @IsString()
    email: string;

    @IsString()
    name: string;
}