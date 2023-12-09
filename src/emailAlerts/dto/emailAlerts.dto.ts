import { Validate, IsBoolean, IsNumber, Min, Max, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmailAlertDto {
    alertCountryName: string;
    alertDistrictName: string;

    @Type(() => Number)
    @IsNumber({}, { message: "Latitude must be a valid number." })
    @Min(-65, { message: "Latitude must be at least -65." })
    @Max(70, { message: "Latitude must be at most 70." })
    alertLatitude: number;

    @Type(() => Number)
    @IsNumber({}, { message: "Longitude must be a valid number." })
    @Min(-180, { message: "Longitude must be at least -180." })
    @Max(180, { message: "Longitude must be at most 180." })
    alertLongitude: number;

    @Type(() => Number)
    @IsNumber({}, { message: "Distance must be an integer." }) // 거리 범위는 50~500km
    @Min(50, { message: "Distance must be at least 50 km." })
    @Max(500, { message: "Distance must not exceed 500 km." })
    alertRadius: number;

    @Type(() => Boolean)
    @IsBoolean()
    alertLevelGreen: boolean;

    @Type(() => Boolean)
    @IsBoolean()
    alertLevelOrange: boolean;

    @Type(() => Boolean)
    @IsBoolean()
    alertLevelRed: boolean;
}

// export class CreateEmailAlertDto {
//     alertCountryName: string;
//     alertDistrictName: string;

//     @Type(() => Number)
//     @IsNumber({}, { message: "Latitude must be a valid number." })
//     @Min(-65, { message: "Latitude must be at least -65." })
//     @Max(70, { message: "Latitude must be at most 70." })
//     alertLatitude: number;

//     @Type(() => Number)
//     @IsNumber({}, { message: "Longitude must be a valid number." })
//     @Min(-180, { message: "Longitude must be at least -180." })
//     @Max(180, { message: "Longitude must be at most 180." })
//     alertLongitude: number;

//     @Type(() => Number)
//     @IsNumber({}, { message: "Distance must be an integer." }) // 거리 범위는 50~500km
//     @Min(50, { message: "Distance must be at least 50 km." })
//     @Max(500, { message: "Distance must not exceed 500 km." })
//     alertRadius: number;

//     @Validate(AtLeastOneTrue) // 셋중 하나는 true여야 함 (커스텀 validator로 아래 3가지 모두 확인)
//     @Transform(({ value }) => value === 'true' || value === true)
//     alertLevelGreen: boolean;
//     @Transform(({ value }) => value === 'true' || value === true)
//     alertLevelOrange: boolean;
//     @Transform(({ value }) => value === 'true' || value === true)
//     alertLevelRed: boolean;
// }
