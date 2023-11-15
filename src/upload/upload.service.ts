import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as ffmpeg from 'fluent-ffmpeg';
@Injectable()
export class UploadService {
    private readonly s3client = new S3Client({ region: this.configService.getOrThrow('AWS_S3_REGION'),
});
    constructor(private readonly configService: ConfigService) {}

    async upload(fileName: string, file: Buffer) {
        //HLS 인코딩 로직
        await this.encodeToHLS(file, fileName);

        await this.s3client.send(
            //인코딩된 파일을 S3에 업로드
            new PutObjectCommand({
                Bucket: 'worldisaster-test-bucket',
                Key: fileName,
                Body: file 
            })
        )
    }

    private async encodeToHLS(file: Buffer, fileName: string): Promise<void> {
        const fs = require('fs');
        const path = require('path');
        //fileName에서 확장자 제거
        const baseName = path.basename(fileName, path.extname(fileName));

        //HLS 파일을 저장할 새로운 폴더경로
        const hlsFolderPath = path.join("C:/HLS_video", baseName);
        if (!fs.existsSync(hlsFolderPath)) {
            fs.mkdirSync(hlsFolderPath, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            //임시 파일 생성
            const tempFilePath = "C:/Programming/SWJungle_07/나만무/test동영상/file.mp4";   //임시 파일 경로 -> 로컬 환경 테스트 용이라 실제 파일 경로
            fs.writeFileSync(tempFilePath, file);   //임시 파일 생성
            ffmpeg(tempFilePath)
                .output(path.join(hlsFolderPath, 'video.m3u8')) 
                .format('hls')
                .videoCodec('libx264')
                .audioCodec('aac')
                .on('end', () => {
                    console.log('Conversion to HLS completed');
                    fs.unlinkSync(tempFilePath);    //임시 파일 삭제
                    resolve();
                })
                .on('error', (err) =>{
                    console.error('Error:', err);
                    fs.unlinkSync(tempFilePath);    //오류 발생 시 임시 파일 삭제
                    reject(err);
                }) 
                .run(); 
        });//FFMPEG를 사용하여 HLS로 인코딩
        
        // 인코딩 된 파일을 임시 경로에 저장
        // 인코딩이 완료되면, 해당 파일들을 S3에 업로드
    }
}
