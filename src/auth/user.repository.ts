import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import * as bcrypt from 'bcryptjs';
import { GoogleUser } from './dto/googleUser.dto';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(
        @InjectRepository(User)
        private readonly repository: Repository<User>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }

    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, password } = authCredentialsDto;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.create({ username, password: hashedPassword });
        try {
            await this.save(user);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Exisiting username');
            } else {
                throw new InternalServerErrorException();
            }
        }
        return user;
    }

    async createGoogleUser(googleUser: GoogleUser): Promise<GoogleUser> {
        const { provider, providerId, email, name } = googleUser;

        let user = await this.findOneBy({ providerId });

        if (!user) {
            user = this.create({
                provider,
                providerId,
                email,
                name,
                // 여기서 추가적인 필드 설정이 필요할 수 있습니다.
                subscriptionLevel_Green: 'false',
                subscriptionLevel_Orange: 'false',
                subscriptionLevel_Red: 'false',
                subscriptionCountry1: 'all',
                subscriptionCountry2: 'all',
                subscriptionCountry3: 'all',
            });

            try {
                await this.save(user);
            } catch (error) {
                if (error.code === '23505') {
                    throw new ConflictException('Existing user with this provider ID');
                } else {
                    throw new InternalServerErrorException();
                }
            }
        }

        return user;
    }
}
