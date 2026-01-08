import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsDecimal, IsInt, IsString } from 'class-validator';
import { CustomerOrderOnlineDetailResponse } from 'src/v1/grpc/interfaces/customer-order-for-channel-food';

export class CustomerOrderDetailResponse {
    
    @ApiProperty({ description: 'Id detail của món ăn' })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ description: 'Id của bill tạm' })
    @Expose()
    @IsInt()
    customer_order_id: number;

    @ApiProperty({ description: 'Id của món ăn' })
    @Expose()
    @IsInt()
    food_id: number;

    @ApiProperty({ description: 'Tên của món ăn' })
    @Expose()
    @IsString()
    food_name: string;

    @ApiProperty({ description: 'Id món cha' })
    @Expose()
    @IsInt()
    order_detail_parent_id: number;

    @ApiProperty({ description: 'Id của món combo cha' })
    @Expose()
    @IsInt()
    order_detail_combo_parent_id: number;

    @ApiProperty({ description: 'Id của bill tạm chưa danh sách món con' })
    @Expose()
    @IsArray()
    @IsInt({ each: true })
    customer_order_detail_addition_ids: string ; 

    @ApiProperty({ description: 'Id của bill tạm chưa danh sách món combo' })
    @Expose()
    @IsArray()
    @IsInt({ each: true })
    customer_order_detail_combo_ids: string ; 

    @ApiProperty({ description: 'Danh sách món combo' })
    @Expose()
    // @Type(() =>  any )
    // customer_order_detail_combo:  FoodInComboResponse[] = [];
    customer_order_detail_combo:  string ; 


    @ApiProperty({ description: 'Danh sách món addition' })
    @Expose()
    // @Type(() => FoodInAdditionResponse)
    // customer_order_detail_addition: FoodInAdditionResponse[] = [];
    customer_order_detail_addition: string ; 

    @ApiProperty({ description: 'Số lượng món' })
    @Expose()
    @IsDecimal()
    quantity: number;

    @ApiProperty({ description: 'Giá' })
    @Expose()
    @IsDecimal()
    price: number;

    @ApiProperty({ description: 'Tổng tiền' })
    @Expose()
    @IsDecimal()
    total_price: number;

    @ApiProperty({ description: 'Có phải món bán kèm không' })
    @Expose()
    @IsInt()
    is_addition: number;

    @ApiProperty({ description: 'Có phải món combo không' })
    @Expose()
    @IsInt()
    is_combo: number;

    @ApiProperty({ description: 'Ghi chú' })
    @Expose()
    @IsString()
    note: string;

    @ApiProperty({ description: 'Tổng tiền món chính với món bán kèm' })
    @Expose()
    @IsDecimal()
    total_price_addition: number;

    @ApiProperty({ description: 'Thời gian tạo' })
    @Expose()
    @IsString()
    created_at: string;

    @ApiProperty({ description: 'Thời gian cập nhật' })
    @Expose()
    @IsString()
    updated_at: string;

    food_options : string ; 

    constructor(entity?: any) {
        this.id = +entity?.id ?? 0;
        this.customer_order_id = entity?.customer_order_id ?? 0;
        this.food_id = entity?.food_id ?? 0;
        this.food_name = entity?.food_name ?? '';
        this.order_detail_parent_id = entity?.order_detail_parent_id ?? 0;
        this.order_detail_combo_parent_id = entity?.order_detail_combo_parent_id ?? 0;
        
        this.customer_order_detail_addition_ids = entity?.customer_order_detail_addition_ids ? entity.customer_order_detail_addition_ids : "[]";
        this.customer_order_detail_combo_ids = entity?.customer_order_detail_combo_ids ? entity.customer_order_detail_combo_ids : "[]" ;
        
        this.customer_order_detail_combo = JSON.stringify(entity?.customer_order_detail_combo ?? []);
        this.customer_order_detail_addition = JSON.stringify(entity?.customer_order_detail_addition ?? []);
        
        this.quantity = +entity?.quantity ?? 0;
        this.price = +entity?.price ?? 0;
        this.total_price = +entity?.total_price ?? 0;
        this.is_addition = entity?.is_addition ?? 0;
        this.is_combo = entity?.is_combo ?? 0;
        
        this.note = entity?.note ?? '';
        this.total_price_addition = +entity?.total_price_addition ?? 0;
        
        this.created_at = entity?.created_at ?? '';
        this.updated_at = entity?.updated_at ?? '';

    }
    


    public mapToList(data: CustomerOrderOnlineDetailResponse[]): CustomerOrderDetailResponse[] {
        return data.map(e => new CustomerOrderDetailResponse(e));
    }
}
