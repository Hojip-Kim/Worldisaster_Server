//SECTION - 유정 RDS config
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { CountryEntity } from '../country/country.entity';
import { CountryMappings } from '../country/script_init/country-table.entity';
import { OldDisastersEntity } from 'src/oldDisasters/oldDisasters.entity';
import { NewDisastersEntity } from 'src/newDisasters/newDisasters.entity';
import { ChatEntity } from 'src/chat/chat.entity';

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'worldisaster-rds.c8vecnz23gk6.ap-northeast-2.rds.amazonaws.com',
    port: 5432,
    username: 'postgres',
    password: 'postdbwjd',
    database: 'worldisaster-test-db',
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

//SECTION - Hozip's RDS config
// export const typeORMConfig: TypeOrmModuleOptions = {
//     type: 'postgres',
//     host: 'worldisaster-database.c1bs1dug29ac.ap-northeast-2.rds.amazonaws.com',
//     port: 5432,
//     username: 'worldisaster',
//     password: 'world123',
//     database: 'worldisaster_db',
//     entities: [__dirname + '/../**/*.entity.{js,ts}',
//         CountryMappings,
//         CountryEntity,
//         OldDisastersEntity,
//         NewDisastersEntity,
//         ChatEntity,
//     ],
//     synchronize: true // true값을주면 애플리케이션을 다시 실행할 때 엔티티안에서 수정된 컬럼의 길이 타입 변경값등을 해당 테이블을 drop한후 다시 생성해줌.
// }