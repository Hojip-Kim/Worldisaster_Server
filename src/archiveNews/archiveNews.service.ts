import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArchiveNewsEntity } from './archiveNews.entity';

// 새로운 재난이 발생하면 Push 해주는 웹소켓 등이 없으니, 주기적으로 리스트 확인이 필요함
@Injectable()
export class ArchiveNewsService {
    constructor(
        @InjectRepository(ArchiveNewsEntity)
        private archiveNewsRepository: Repository<ArchiveNewsEntity>,
    ) { }

    async getArchiveNewsBydID(dID: string): Promise<ArchiveNewsEntity[]> {
        return this.archiveNewsRepository.find({ where: {dID} });
    }

}