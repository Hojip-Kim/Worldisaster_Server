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
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadVideoDto: UploadVideoDto,
        @Res() res: Response
    ) {

        await this.uploadService.upload(uploadVideoDto, file.originalname, file.buffer, dID);
        
    }
    @Get('/:dID')
    async getVideoPage(@Param('dID') dID: string, @Res() res: Response) {
        const videos = await this.uploadService.getVideoUrl(dID);
        // console.log(video_url);
        if(videos.length === 0) {
            console.log('Video not found');
            return res.status(404).send('Video not found');
        }
        // video 배열에서 각 video의 url만 추출하여 새 배열 생성
        const videoUrls = videos.map(video => video.video_url);

        return res.json({ urls: videoUrls });
        // const htmlContent = `
        // <!DOCTYPE html>
        // <html lang="en">
        // <head>
        //     <meta charset="UTF-8">
        //     <title>Video Test</title>
        //     <link href="https://unpkg.com/video.js/dist/video-js.css" rel="stylesheet">
        //     <script src="https://unpkg.com/video.js/dist/video.js"></script>
        //     <script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
        //     <script src="https://cdn.jsdelivr.net/npm/hls.js@canary"></script>
        // </head>
        // <body>
        //     <video id="example-video" width="960" height="540" class="video-js vjs-default-skin" controls>
        //         <source src="${video_url}" type="application/x-mpegURL">
        //     </video>
        //     <script>
        //         var player = videojs('example-video');
        //         if (Hls.isSupported()) {
        //             var hls = new Hls();
        //             hls.loadSource('${video_url}');
        //             hls.attachMedia(player.el());
        //             hls.on(Hls.Events.MANIFEST_PARSED, function() {
        //                 player.play();
        //             });
        //         } else if (player.tech().canPlayType('application/vnd.apple.mpegurl')) {
        //             player.src('${video_url}');
        //             player.play();
        //         }
        //     </script>
        // </body>
        // </html>`;
        // res.status(200).send(htmlContent);
    }
    
}
