import { Validate, IsNumber, Min, Max, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Transform } from 'class-transformer';

@ValidatorConstraint({ name: 'AtLeastOneTrue', async: false })
export class AtLeastOneTrue implements ValidatorConstraintInterface {
    validate(obj: any, args: ValidationArguments) {
        return obj.alertLevelGreen || obj.alertLevelOrange || obj.alertLevelRed;
    }

    defaultMessage(args: ValidationArguments) {
        return 'At least one alert level must be true.';
    }
} // Alert-level을 검증하기 위한 커스텀 밸리데이터 구성

export class CreateEmailAlertDto {
    alertCountryName: string;
    alertDistrictName: string;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: "Latitude must be a valid number." })
    @Min(-65, { message: "Latitude must be at least -65." })
    @Max(70, { message: "Latitude must be at most 70." })
    alertLatitude: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: "Longitude must be a valid number." })
    @Min(-180, { message: "Longitude must be at least -180." })
    @Max(180, { message: "Longitude must be at most 180." }) alertLongitude: number;

    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: "Distance must be an integer." }) // 거리 범위는 50~500km
    @Min(50, { message: "Distance must be at least 50 km." })
    @Max(500, { message: "Distance must not exceed 500 km." })
    alertRadius: number;

    @Validate(AtLeastOneTrue) // 셋중 하나는 true여야 함 (커스텀 validator로 아래 3가지 모두 확인)
    @Transform(({ value }) => value === 'true' || value === true)
    alertLevelGreen: boolean;
    @Transform(({ value }) => value === 'true' || value === true)
    alertLevelOrange: boolean;
    @Transform(({ value }) => value === 'true' || value === true)
    alertLevelRed: boolean;
}
