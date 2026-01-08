import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Min } from "class-validator";
import { UtilsBaseExceptionLangValidator } from "src/utils.common/utils.exception.lang.common/utils.base.exception.lang.validator";

export class SettingCommissionPercentDto {

  @ApiProperty({
    required: true,
    default: 0,
    example: 1,
    description: "Id cài đặt phí nền tảng , id = 0 thì tạo , id > 0 thì cập nhập"
  })
  @Type(() => Number)
  readonly id: number = 0 ;

  @ApiProperty({
    required: true,
    default: 1,
    example: 1,
    description:
      UtilsBaseExceptionLangValidator.exceptionStringRestaurant(),
  })
  @Type(() => Number)
  @Min(1)
  readonly restaurant_id: number;

  @ApiProperty({
    required: true,
    default: 1,
    example: 1,
    description:
      UtilsBaseExceptionLangValidator.exceptionStringRestaurantBrand(),
  })
  @Type(() => Number)
  @Min(1)
  readonly restaurant_brand_id: number;

  @ApiProperty({
    required: true,
    default: 1,
    example: 1,
    description: UtilsBaseExceptionLangValidator.exceptionStringBranch(),
  })
  @Type(() => Number)
  @Min(1)
  readonly branch_id: number;

  @ApiProperty({
    required: false,
    default: 1,
    example: 1,
    description : "Id kênh bán món ăn"
  })
  @Type(() => Number)
  @Min(0)
  readonly channel_order_food_id: number = 0;

  @ApiProperty({
    required: false,
    default: 1,
    example: 1,
    description : "phần trăm phí nền tảng"
  })
  @Type(() => Number)
  @Min(1)
  readonly percent: number = 1;

}