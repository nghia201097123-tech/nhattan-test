import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ChangeConnectionChannelOrderFoodTokenDto {

  @ApiProperty({
    required: false,
    default: "0",
    example: "1",
    description:"Số lượng tài khoản cho phép kết nối"

  })
  @IsInt()
  quantity_account: number = 0;
}
