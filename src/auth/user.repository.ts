import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
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

    async createGoogleUser(googleUser: GoogleUser): Promise<GoogleUser> {
        const { provider, providerId, email, name } = googleUser;

        let user = await this.findOneBy({ providerId });

        if (!user) {
            user = this.create({
                provider,
                providerId,
                email,
                name,
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
