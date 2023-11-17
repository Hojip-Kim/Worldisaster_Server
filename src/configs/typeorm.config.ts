import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'worldisaster-rds.c8vecnz23gk6.ap-northeast-2.rds.amazonaws.com',
    port: 5432,
    username: 'postgres',
    password: 'postdbwjd',
    database: 'video',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
    ssl:{
        rejectUnauthorized: false, // 이 부분을 추가하세요.
    },
    extra: {
        trustServerCertificate: true,
        Encrypt: true,
        IntegratedSecurity: false,
    }
}