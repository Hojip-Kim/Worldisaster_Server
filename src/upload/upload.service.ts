import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { Video } from './video.entity';
import { VideoRepository } from './video.repository';
import { UploadVideoDto } from './dto/upload-video.dto';
import { NewDisastersEntity } from '../newDisasters/newDisasters.entity';

@Injectable()
export class UploadService {
    private readonly s3client = new S3Client;
    // 지원하는 파일 형식 목록
    private readonly supportedFormats = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpg', 'mpeg'];
    constructor(
        private readonly configService: ConfigService,
        private videoRepository: VideoRepository,
        @InjectRepository(NewDisastersEntity)
        private newDisasterRepository: Repository<NewDisastersEntity>,
    ) {
        this.s3client = new S3Client({
            region: this.configService.getOrThrow('AWS_S3_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get<string>('AWS_ACCESS_SECRET_KEY'),
            },
        });
    }

    async upload(uploadVideoDto: UploadVideoDto, fileName: string, file: Buffer, dID: string) {
        const supportedFormats = ['mp4'];
        const fileExtension = path.extname(fileName).toLowerCase().substring(1);

        // 파일 형식 검증
        if (!supportedFormats.includes(fileExtension)) {
            throw new BadRequestException('Only MP4 files are supported.');
        }

        //서버 공간에 동영상 임시 저장
        const tempFilePath = path.join("/home/ubuntu/temp", fileName);
        const disasterDetail = await this.newDisasterRepository.findOne({ where: {dID} });
        //tempFilePath에 file을 저장
        fs.writeFileSync(tempFilePath, file);
        console.log(`File saved to ${tempFilePath}`);
        //HLS 인코딩
        await this.encodeToHLS(file, fileName, tempFilePath);
        //인코딩이 끝나면, 임시 저장해둔 파일 삭제
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`File deleted from ${tempFilePath}`);
        }
        //HLS 파일 디렉토리
        const baseName = path.basename(fileName, path.extname(fileName));
        const hlsFolderPath = path.join("/home/ubuntu/video", baseName);

        //S3에 HLS 파일 업로드
        await this.uploadToS3(hlsFolderPath, baseName);

        console.log('HLS files uploaded to S3');
        //db에 url 저장
        const { video_url, video_name } = uploadVideoDto;
        
        //NOTE - 유정 cloudfront url
        // video_url: `https://d2v41mvu3zgnz0.cloudfront.net/${baseName}/${baseName}.m3u8`,
        // const video = this.videoRepository.create({
        //     video_url: `https://doim6x5685p82.cloudfront.net/${baseName}/${baseName}.m3u8`,
        //     video_name: baseName
            
        // })

        const video = new Video();
        video.video_url = `https://doim6x5685p82.cloudfront.net/${baseName}/${baseName}.m3u8`;
        video.video_name = baseName;
        video.disasterDetail = disasterDetail;

        await this.videoRepository.save(video);
        //cloudfront로 배포한 url 제공
        // return `https://d2v41mvu3zgnz0.cloudfront.net/${baseName}/${baseName}.m3u8`;
        // await this.s3client.send(
        //     //인코딩된 파일을 S3에 업로드
        //     new PutObjectCommand({
        //         Bucket: 'worldisaster-test-bucket',
        //         Key: fileName,
        //         Body: file 
        //     })
        // )
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
                .output(path.join(hlsFolderPath, `${baseName}.m3u8`)) 
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

    private async uploadToS3(folderPath: string, baseName: string): Promise<void> {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStream = fs.createReadStream(filePath);


            //NOTE - 유정 S3 버킷 
            //Bucket: 'worldisaster-test-bucket',
            await this.s3client.send(new PutObjectCommand({
                    Bucket: 'worldisaster-s3',
                    Key: `${baseName}/${file}`,
                    Body: fileStream,
                    ContentDisposition: 'inline',
                    ContentType: 'application/vnd.apple.mpegurl'    //HLS 파일의 경우 Content-Type을 지정해주어야 함
            }));
        }
    }

    //db objID 로 url 가져오기
    async getVideoUrl(dID: string): Promise<Video[]> {
        const video = await this.videoRepository.find({ where : { disasterDetail : {dID} }});

        // if(!video) {
        //     throw new NotfoundException(`Video with ID "${id}" not found`);
        // }

        return video;
    }
}
