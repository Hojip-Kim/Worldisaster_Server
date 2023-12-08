import { ConsoleLogger, Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, Get, Param, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { UploadVideoDto } from './dto/upload-video.dto';
import { Video } from './video.entity';
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}

    
    @Post('/:dID')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('dID') dID: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        console.log("@@@@@@upload video start@@@@@@");
        return await this.uploadService.upload(file.originalname, file.buffer, dID);
        
    }
    @Get('/:dID')
    async getVideoPage(@Param('dID') dID: string, @Res() res: Response) {
        
        const videos = await this.uploadService.getVideoUrl(dID);
        // if(videos.length === 0) {
        //     console.log('Video not found');
        //     return res.status(404).send('Video not found');
        // }
        // video 배열에서 각 video의 url만 추출하여 새 배열 생성
        // const videoUrls = videos.map(video => video.video_url);

        return res.json(videos);
    }
    
}
