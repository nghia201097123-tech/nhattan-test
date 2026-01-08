import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChannelOrderRefresh {

  @IsNumber()
  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id đơn hàng"

  })
  id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id đối tác"

  })
  @IsNumber()
  channel_order_food_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "mã đơn hàng đối tác"

  })
  @IsString()
  channel_order_code: string;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id đơn hàng đối tác"

  })
  @IsString()
  channel_order_id: string;
}

export class ChannelOrderRefreshDto {

  // @ApiProperty({
  //   required: false,
  //   default: "0",
  //   example: "",
  //   description: "id nhà hàng"

  // })
  // @IsNumber()
  // restaurant_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id thương hiệu"

  })
  @IsNumber()
  restaurant_brand_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id chi nhánh"

  })
  @IsNumber()
  branch_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "danh sách đơn hàng cần quét",
    type: [ChannelOrderRefresh] 

  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelOrderRefresh)
  channel_orders: ChannelOrderRefresh[];
}
