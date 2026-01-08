
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
export class SyncChannelBranchDTO {

  @ApiProperty({
    required: true,
    default: "0",
    example: "",
    description: "id thương hiệu"

  })
  @Type(() => Number)
  restaurant_brand_id: number;

  @ApiProperty({
    required: true,
    default: "0",
    example: "",
    description: "id kênh đối tác"

  })
  @Type(() => Number)
  channel_order_food_id: number;

}