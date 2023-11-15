import { ConsoleLogger, Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
        new ParseFilePipe({
            validators: [
                // new MaxFileSizeValidator({maxSize: 1024 * 1024 * 2}), 
                // new FileTypeValidator({ fileType: 'video/mp4'})
            ],
        }),
    ) file: Express.Multer.File,
    ) {
        console.log(file.originalname);
        console.log(file.buffer);
        await this.uploadService.upload(file.originalname, file.buffer);
    }
}
