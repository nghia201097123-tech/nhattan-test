import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional,IsNotEmpty } from 'class-validator';

export class ChannelOrderFoodDto {

  @ApiProperty({
        required: false,
        default: "",
        example: "Shoppe Food",
        description:"Tên đối tác tích hợp"

  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    default: "",
    example: "SHF",
    description:"Mã đối tác tích hợp"

  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    required: false,
    default: "",
    example: "",
    description:"HÌnh ảnh đối tác tích hợp"

  })
  @IsString()
  @IsOptional()
  avatar?: string;

}
