// redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [{
        provide: 'REDIS_CLIENT',
        useFactory: () => {
            return new Redis({
                host: '13.209.68.244',
                port: 6379
            });
        },
    }],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
