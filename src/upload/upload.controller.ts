import { ConsoleLogger, Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';
@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response
    ) {
        console.log(file.originalname);
        console.log(file.buffer);
        const url = await this.uploadService.upload(file.originalname, file.buffer);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Video Test</title>
            <link href="https://unpkg.com/video.js/dist/video-js.css" rel="stylesheet">
            <script src="https://unpkg.com/video.js/dist/video.js"></script>
            <script src="https://unpkg.com/videojs-contrib-hls/dist/videojs-contrib-hls.js"></script>
        </head>
        <body>
            <video id="example-video" width="960" height="540" class="video-js vjs-default-skin" controls>
                <source src="${url}" type="application/x-mpegURL">
            </video>

            <script>
                var player = videojs('example-video');
                player.play();
            </script>
        </body>
        </html>`;   
        res.status(200).send(htmlContent);
    }
}
