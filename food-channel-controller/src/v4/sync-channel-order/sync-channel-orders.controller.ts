import { Controller, HttpStatus } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
import { SyncChannelOrdersService } from "./sync-channel-orders.service";

@Controller()
export class SyncChannelOrderController {

    constructor(
        private readonly syncChannelOrdersService: SyncChannelOrdersService

) {}

    

    @GrpcMethod("OrderChannelOrderFoodService", "getOrderDetails")
    async getOrderDetails(data : { channel_order_id : number , channel_order_food_id : number , order_id : string }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        let result = await this.syncChannelOrdersService.getOrderDetailsGrpc(
            data.channel_order_id , data.channel_order_food_id , data.order_id 
        )

        if(result.status != HttpStatus.OK){
            response.setStatus(result.status);
            response.setMessageError(result.message);
            return response;
        }

        response.setData(result.data);
    
        return response;
    }

    @GrpcMethod("OrderChannelOrderFoodService", "updateOrder")
    async updateOrder(data : { channel_order_id : number , restaurant_order_id : number  }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();


        let result = await this.syncChannelOrdersService.updateOrderGrpc( data.channel_order_id ,data.restaurant_order_id);

        if(result.status != HttpStatus.OK){
            response.setStatus(result.status);
            response.setMessageError(result.message);
            return response;
        }
       
        return response;
    }


    @GrpcMethod("OrderChannelOrderFoodService", "getListChannelOrder")
    async getListChannelOrder(data : { restaurant_id : number , channel_order_ids : string }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        let result = await this.syncChannelOrdersService.getListChannelOrderGrpc(data.restaurant_id,data.channel_order_ids);

        if(result.status != HttpStatus.OK){
            response.setStatus(result.status);
            response.setMessageError(result.message);
            return response;
        }

        response.setData(result.data);
      
        return response;
    }

    @GrpcMethod("OrderChannelOrderFoodService", "updateOrderV2")
    async updateOrderV2(data : { restaurant_id : number , channel_order_update_json : string  }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        let result = await this.syncChannelOrdersService.updateOrderV2Grpc( data.restaurant_id ,data.channel_order_update_json);

        if(result.status != HttpStatus.OK){
            response.setStatus(result.status);
            response.setMessageError(result.message);
            return response;
        }
       
        return response;
    }
}