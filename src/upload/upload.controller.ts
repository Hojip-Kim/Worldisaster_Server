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


    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadVideoDto: UploadVideoDto
    ) {

        await this.uploadService.upload(uploadVideoDto, file.originalname, file.buffer);

    }
    @Get('/:id')
    async getVideoPage(@Param('id') id: number, @Res() res: Response) {
        const video_url = await this.uploadService.getVideoUrl(id);
        if(!video_url) {
            console.log('video_url is null');
            return res.status(404).send('Video not found');
        }
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Video Test</title>
            <link href="https://unpkg.com/video.js/dist/video-js.css" rel="stylesheet">
            <script src="https://unpkg.com/video.js/dist/video.js"></script>
            <script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/hls.js@canary"></script>
        </head>
        <body>
            <video id="example-video" width="960" height="540" class="video-js vjs-default-skin" controls>
                <source src="${video_url}" type="application/x-mpegURL">
            </video>
            <script>
                var player = videojs('example-video');
                if (Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource('${video_url}');
                    hls.attachMedia(player.el());
                    hls.on(Hls.Events.MANIFEST_PARSED, function() {
                        player.play();
                    });
                } else if (player.tech().canPlayType('application/vnd.apple.mpegurl')) {
                    player.src('${video_url}');
                    player.play();
                }
            </script>
        </body>
        </html>`;
        res.status(200).send(htmlContent);
    }
    
}
