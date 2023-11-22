import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'hojipkim',
    password: 'postgres',
    database: 'worldisaster',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true // true값을주면 애플리케이션을 다시 실행할 때 엔티티안에서 수정된 컬럼의 길이 타입 변경값등을 해당 테이블을 drop한후 다시 생성해줌.
}