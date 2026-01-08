import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { IsNotNull } from 'src/utils.common/utils.decorator.common/utils.decorator.common';

export class UpdateChannelOrderFoodTokenDto {

  @ApiProperty({
    required: false,
    default: "",
    example: "B:oe5tm2E+t01GD2NdkkprmVYWqj6fDr9nsL7vrpIIV8nVbS06CI6haZ8sn42lKqhB59PTR5G/XrRpT9sY229Yra/db9r/TlMVrUOxFGA7imM=",
    description:"access token , chỉ giành cho đối tác Shopee food"

  })
  @IsString()
  @IsNotNull()
  access_token: string = '';


  @ApiProperty({
    required: false,
    default: "",
    example: "abc123",
    description:"Tên tài khoản , không giành cho đối tác Shopee food"

  })
  @IsString()
   @IsNotNull()
  username: string;

  @ApiProperty({
    required: false,
    default: "",
    example: "********",
    description:"Mật khẩu , không giành cho đối tác Shopee food"

  })
  @IsString()
  @IsNotNull()
  password: string;

  @ApiProperty({
    required: false,
    default: "",
    example: "********",
    description:"token nhà hàng , giành cho đối tác Shopee food"

  })
  @IsString()
  @IsNotNull()
  x_merchant_token: string;

  @ApiProperty({
    required: false,
    default: "",
    example: "b0fe3446046abde0",
    description:"id thiết bị , dành cho GRAB"

  })
  @IsString()
  @IsNotNull()
  device_id: string;


  @ApiProperty({
    required: false,
    default: "",
    example: "OPPO",
    description:"Tên thương hiệu thiết bị , dành cho GRAB"

  })
  @IsString()
  @IsNotNull()
  device_brand: string;
}
