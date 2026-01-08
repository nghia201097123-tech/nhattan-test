import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";
import { IsNotNull } from "src/utils.common/utils.decorator.common/utils.decorator.common";


export class SHFUpdateFoodDto {

    @ApiProperty({
        required: false,
        default: "0",
        example: "1",
        description:"Id thương hiệu"
    
    })
    @IsInt()
    restaurant_brand_id: number = 0 ;


    @ApiProperty({
        required: false,
        default: "0",
        example: "1",
        description:"Id đối tác tích hợp"
    
      })
    @IsInt()
    channel_order_food_id: number = 0;


    @ApiProperty({
        required: false,
        default: "",
        example: "Lẩu gà",
        description:"Tên món ăn"
    
      })
    @IsString()
    @IsNotNull()
    name: string = '';


    @ApiProperty({
        required: false,
        default: "",
        example: "",
        description:""
    
      })
    @IsString()
    @IsNotNull()
    description: string = '';


    @ApiProperty({
        required: false,
        default: "0",
        example: "1",
        description:"Giá bán"
    
      })
    @IsInt()
    price: number = 0;

}