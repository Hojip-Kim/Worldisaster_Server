import { ConsoleLogger, Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [new MaxFileSizeValidator({maxSize: 1024 * 1024 * 2}), new FileTypeValidator({ fileType: 'video/mp4'})]
        })
    ) file: Express.Multer.File) {
        console.log(file);
    }
}
