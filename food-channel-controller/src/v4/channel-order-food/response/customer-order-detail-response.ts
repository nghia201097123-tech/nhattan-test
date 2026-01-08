import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsDecimal, IsInt, IsString } from 'class-validator';
import { OrderDetail } from 'src/v1/grpc/interfaces/channel-order';

export class CustomerOrderDetailResponse {
    
    @ApiProperty({ description: 'Id detail của món ăn' })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ description: 'Id của món ăn' })
    @Expose()
    @IsInt()
    food_id: string;

    @ApiProperty({ description: 'Tên của món ăn' })
    @Expose()
    @IsString()
    food_name: string;

    @ApiProperty({ description: 'Số lượng món' })
    @Expose()
    @IsDecimal()
    quantity: number;

    @ApiProperty({ description: 'Giá' })
    @Expose()
    @IsDecimal()
    price: number;


    @ApiProperty({ description: 'Ghi chú' })
    @Expose()
    @IsString()
    note: string;

    @ApiProperty({ description: 'Tổng tiền món chính với món bán kèm' })
    @Expose()
    @IsDecimal()
    total_price_addition: number;

    @ApiProperty({ description: 'Id detail của món ăn' })
    @IsInt()
    restaurant_kitchen_place_id: number;

    @ApiProperty({ description: 'Id detail của món ăn' })
    @IsInt()
    is_allow_print_stamp: number;

    food_options : any[] = [];

    constructor(entity?: any) {
        this.id = +(entity?.id ?? 0);
        this.food_id = entity?.food_id ?? '';
        this.food_name = entity?.food_name ?? '';
        this.quantity = +(entity?.quantity ?? 0);
        this.price = +(entity?.price ?? 0);
        this.note = entity?.note ?? '';
        this.total_price_addition = +(entity?.total_price_addition ?? 0);
        this.food_options = (entity?.food_options ? JSON.parse(entity.food_options) : []);
        this.is_allow_print_stamp=+(entity?.is_allow_print_stamp ?? 0);
        this.restaurant_kitchen_place_id=+(entity?.restaurant_kitchen_place_id ?? 0);
    }

    


    public mapToList(data: any[]): CustomerOrderDetailResponse[] {
        return data.map(e => new (e));
    }
}
