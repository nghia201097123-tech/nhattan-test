
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Min } from 'class-validator';
export class HandleStatusChannelOrderDTO {

  @ApiProperty({
    required: true,
    default: "0",
    example: "",
    description: "id đơn app food"

  })
  @Type(() => Number)
  @Min(1, { message: 'id đơn app food phải lớn hơn 0' })
  id: number;

  @ApiProperty({
    required: true,
    default: "0",
    example: "",
    description: "id đơn techres"

  })
  @Type(() => Number)
  @Min(0, { message: 'id đơn techres phải lớn hơn 0' })
  restaurant_order_id: number;

}