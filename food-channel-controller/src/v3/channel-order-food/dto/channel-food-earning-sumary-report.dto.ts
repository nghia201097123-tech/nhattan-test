import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { Min } from "class-validator";
import { IsNotNull } from "src/utils.common/utils.decorator.common/utils.decorator.common";
import { UtilsBaseExceptionLangValidator } from "src/utils.common/utils.exception.lang.common/utils.base.exception.lang.validator";

export class ChannelFoodEarningSuamryReportDto {
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
  readonly branch_id: number;

  @ApiProperty({
    required: false,
    example: "",
    description: UtilsBaseExceptionLangValidator.exceptionStringFromDate(),
  })
  readonly from_date: string;

  @ApiProperty({
    required: false,
    example: "",
    description: UtilsBaseExceptionLangValidator.exceptionStringToDate(),
  })
  readonly to_date: string;

  @ApiProperty({
    required: false,
    example: "",
    description: "Id chi nhánh kệnh bán hàng",
  })
  @IsNotNull()
  readonly channel_branch_id: string = '';

}