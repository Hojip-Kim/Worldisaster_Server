import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Video } from "./video.entity";

@Injectable()
export class VideoRepository extends Repository<Video> {
    constructor(
        @InjectRepository(Video)
        private readonly repository: Repository<Video>
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }
}