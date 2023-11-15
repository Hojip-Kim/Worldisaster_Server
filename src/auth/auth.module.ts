import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt'}),
        JwtModule.register({
            secret: 'Secret1234',
            signOptions: {
                expiresIn: 60*60, // 한시간
            }
        }),
        TypeOrmModule.forFeature([User])
    ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy],
  exports: [UserRepository, JwtStrategy, PassportModule]
})
export class AuthModule {}


// @Module({
//     imports: [
//       TypeOrmModule.forFeature([Board])
//     ],
//     controllers: [BoardsController],
//     providers: [BoardsService, BoardRepository],
//     exports: [BoardRepository]
//   })
//   export class BoardsModule {}
  