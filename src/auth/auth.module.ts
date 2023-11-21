import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './Google/google.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: 60 * 60,
                },
            }),
            inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([User])
    ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, GoogleStrategy],
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
  