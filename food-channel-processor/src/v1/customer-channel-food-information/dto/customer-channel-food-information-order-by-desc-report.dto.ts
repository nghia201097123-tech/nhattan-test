import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, Min } from "class-validator";
import { IsInReportType } from "src/utils.common/utils.decorator.common/utils.decorator.common";
import { ReportTypeEnum } from "src/utils.common/utils.enum/utils.report-type.enum";
import { UtilsBaseExceptionLangValidator } from "src/utils.common/utils.exception.lang.common/utils.base.exception.lang.validator";

export class CustomerChannelFoodInformationOrderByDescReportDto {

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
    default: '1,2,3',
    example: '2,3,1',
    description: "Danh sách chi nhánh",
  })
  @IsNotEmpty()
  readonly branch_ids: string = "0"; 

  @ApiProperty({
    required: false,
    default: -1,
    example: 1,
    description : "Id food channel"
  })
  @Type(() => Number)
  readonly food_channel_id: number = -1;

  @ApiProperty({
    required: false,
    example: "",
    description: UtilsBaseExceptionLangValidator.exceptionStringDate(),
  })
  readonly date_string: string;

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
    description: UtilsBaseExceptionLangValidator.exceptionStringReportType(),
  })
  @Type(() => Number)
  @IsInReportType()
  readonly report_type: number = ReportTypeEnum.DEFAULT;

  @ApiProperty({
    required: false,
    example: 10,
    description: UtilsBaseExceptionLangValidator.exceptionStringLimit(),
  })
  @Type(() => Number)
  readonly limit: number = 10;


  @ApiProperty({
    required: false,
    example: "",
    description: UtilsBaseExceptionLangValidator.exceptionStringPage(),
  })
  @Type(() => Number)
  readonly page: number = 1;

}