// src/channel-order-food/dto/create-channel-order-food.dto.ts

import { ApiProperty } from '@nestjs/swagger';
export class FoodChannelRegisterDTO {

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id nhà hàng"

  })
  restaurant_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id thương hiệu"

  })
  restaurant_brand_id: number;

  @ApiProperty({
    required: false,
    default: "0",
    example: "",
    description: "id chi nhánh"

  })
  branch_id: number;
}
