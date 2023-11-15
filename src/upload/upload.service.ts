import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
    private readonly s3client = new S3Client({ region: this.configService.getOrThrow('AWS_S3_REGION'),
});
    constructor(private readonly configService: ConfigService) {}

    async upload(fileName: string, file: Buffer) {
        await this.s3client.send(
            new PutObjectCommand({
                Bucket: 'worldisaster-test-bucket',
                Key: fileName,
                Body: file 
            })
        )
    }
}
