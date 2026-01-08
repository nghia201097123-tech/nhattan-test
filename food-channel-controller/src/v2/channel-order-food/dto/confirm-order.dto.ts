// src/channel-order-food/dto/create-channel-order-food.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotNull } from 'src/utils.common/utils.decorator.common/utils.decorator.common';
import { IsArray, IsNumber } from 'class-validator';
export class ConfirmOrdersDto {

  @ApiProperty({
    required: true,
    default: "[]",
    example: "",
    description: "danh sách id đơn hàng"

  })
  @IsNotNull()
  @IsArray()
  @IsNumber({}, { each: true })
  order_ids: number[] = [];
}
