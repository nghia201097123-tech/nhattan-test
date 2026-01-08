import { ApiProperty } from "@nestjs/swagger";



export class ChannelBranchGrpcResponse {

    @ApiProperty({ description: 'id chi nhánh' })
    branch_id: string;

    @ApiProperty({ description: 'tên chi nhánh' })
    branch_name: string;

    @ApiProperty({ description: 'id token kênh đối tác' })
    channel_order_food_token_id: number;

    @ApiProperty({ description: 'tên token kênh đối tác' })
    channel_order_food_token_name: string;

    @ApiProperty({ description: 'địa chỉ chi nhánh' })
    branch_address: string;

    @ApiProperty({ description: 'số điện thoại chi nhánh' })
    branch_phone: string;

    
    constructor(entity?: any) {
        this.branch_id = entity?.channel_branch_id ?? '';
        this.branch_name = entity?.channel_branch_name ?? '';
        this.channel_order_food_token_id = entity?.channel_order_food_token_id ?? 0;
        this.channel_order_food_token_name = entity?.channel_order_food_token_name ?? '';
        this.branch_address = entity?.channel_branch_address ?? '';
        this.branch_phone = entity?.channel_branch_phone ?? '';
    }
      
    public mapToListData(data: any[]) {
      let response: ChannelBranchGrpcResponse[] = [];
      data.forEach((e) => {
        response.push(new ChannelBranchGrpcResponse(e));
      });
      return response;
    }
}