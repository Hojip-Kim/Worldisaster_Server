import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
    private readonly s3client = new S3Client({});
    // constructor(private readonly configService: ConfigService) {}

    async upload(fileName: string, file: Buffer) {
        //서버 공간에 동영상 임시 저장
        const tempFilePath = path.join("/home/ubuntu/temp", fileName);
        //tempFilePath에 file을 저장
        fs.writeFileSync(tempFilePath, file);
        console.log('File saved to ${tempFilePath}');
        //HLS 인코딩
        await this.encodeToHLS(file, fileName, tempFilePath);

        //인코딩이 끝나면, 임시 저장해둔 파일 삭제
        fs.unlinkSync(tempFilePath);
        console.log('File deleted from ${tempFilePath}'); 

        await this.s3client.send(
            //인코딩된 파일을 S3에 업로드
            new PutObjectCommand({
                Bucket: 'worldisaster-test-bucket',
                Key: fileName,
                Body: file 
            })
        )
    }

    private async encodeToHLS(file: Buffer, fileName: string, tempFilePath: string): Promise<void> {
        //fileName에서 확장자 제거
        const baseName = path.basename(fileName, path.extname(fileName));

        //HLS 파일을 저장할 새로운 폴더경로
        const hlsFolderPath = path.join("/home/ubuntu/video", baseName);
        if (!fs.existsSync(hlsFolderPath)) {
            fs.mkdirSync(hlsFolderPath, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            //임시 파일 생성
            // const tempFilePath = "C:/Programming/SWJungle_07/나만무/test동영상/file.mp4";   //임시 파일 경로 -> 로컬 환경 테스트 용이라 실제 파일 경로
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
    }
}
