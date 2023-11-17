import { IsNotEmpty } from "class-validator";

export class UploadVideoDto {
    @IsNotEmpty()
    video_url: string;

    @IsNotEmpty()
    video_name: string;
}