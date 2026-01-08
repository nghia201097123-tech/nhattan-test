import { Controller, HttpStatus } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Pagination } from "src/utils.common/utils.pagination.pagination/utils.pagination";
import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
import { SyncChannelOrdersService } from "./sync-channel-orders.service";
import { ChannelOrderByIdsResponse } from "./response/channel-order-by-ids.response";
import { RedisService } from "src/redis/redis.service";

@Controller()
export class SyncChannelOrderController {

    constructor(
        private readonly syncChannelOrdersService: SyncChannelOrdersService,
        private readonly redisService: RedisService

) {}

    @GrpcMethod("OrderChannelOrderFoodService", "getListOrder")
    async getListOrder(data : {restaurant_id : number , restaurant_brand_id : number , channel_order_food_id : number , channel_branch_ids : string , key_search : string , limit :number , page : number , is_have_restaurant_order : number }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        try {
            let result = await this.syncChannelOrdersService.spGListOrderForGrpc(data.restaurant_id , data.restaurant_brand_id ,-1, 
                data.channel_order_food_id , data.channel_branch_ids , data.key_search,data.is_have_restaurant_order , await new Pagination(+data.page,+data.limit));

            response.setData({
                limit : data.limit,
                total_record : result.total_record,
                list : result.list
            });
        } catch (error) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError(error);
        }
        return response;
    }

    @GrpcMethod("OrderChannelOrderFoodService", "getOrderDetails")
    async getOrderDetails(data : { channel_order_id : number , channel_order_food_id : number , order_id : string }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        try {

            let result = await this.syncChannelOrdersService.spGOrderForGrpc( data.channel_order_id , data.channel_order_food_id , data.order_id );

            let resultDeatail = await this.syncChannelOrdersService.getDetails( result.id );

            response.setData({
                id: result.id,
                order_id: result.order_id,
                channel_order_food_id: result.channel_order_food_id,
                channel_branch_id: result.channel_branch_id,
                total_amount: result.total_amount,
                driver_name: result.driver_name,
                driver_avatar: result.driver_avatar,
                channel_order_food_name: result.channel_order_food_name,
                channel_order_food_code: result.channel_order_food_code,
                details: resultDeatail,
                display_id : result.display_id,
                discount_amount : result.discount_amount,
                restaurant_order_id : result.restaurant_order_id,
                customer_order_amount : result.customer_order_amount,
                customer_discount_amount : result.customer_discount_amount,
                order_amount : result.order_amount,
                driver_phone : result.driver_phone,
                customer_name : result.customer_name,
                phone : result.customer_phone,
                address : result.delivery_address,
                shipping_fee : result.delivery_amount,
                create_at : result.order_created_at,
                channel_branch_name : result.channel_branch_name,
                channel_branch_address : result.channel_branch_address,
                channel_branch_phone : result.channel_branch_phone,
                note : result.note,
                item_discount_amount : result.item_discount_amount
            });
        } catch (error) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError(error);
        }
        return response;
    }

    // @GrpcMethod("OrderChannelOrderFoodService", "updateOrder")
    // async updateOrder(data : { channel_order_id : number , restaurant_order_id : number  }): Promise<any> {

    //     let response: BaseResponseData = new BaseResponseData();        

    //     try {

    //         const dataOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.channel_order_id);
            
    //         if(!dataOrder){
    //             response.setStatus(HttpStatus.BAD_REQUEST);
    //             response.setMessageError("Đơn hàng không tồn tại");
    //         }
            
    //         await this.syncChannelOrdersService.updateChannelOrder( dataOrder , data.restaurant_order_id );            
            
    //         let keyGetChannelOrder = `food_channel_processor:get-channel-order-${dataOrder.restaurant_id}-${dataOrder.restaurant_brand_id}-${dataOrder.branch_id}`;

    //         await this.redisService.deleteKeysWithPrefix(keyGetChannelOrder);

    //     } catch (error) {
    //         response.setStatus(HttpStatus.BAD_REQUEST);
    //         response.setMessageError(error);
    //     }
    //     return response;
    // }

    @GrpcMethod("OrderChannelOrderFoodService", "getListChannelOrder")
    async getListChannelOrder(data : { restaurant_id : number , channel_order_ids : string }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        try {            

            let result = await this.syncChannelOrdersService.spGListChannelOrderByIds(data.restaurant_id,data.channel_order_ids);

            response.setData(new ChannelOrderByIdsResponse().mapToList(result));            

        } catch (error) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError(error);
        }
        return response;
    }

    @GrpcMethod("OrderChannelOrderFoodService", "updateOrderV2")
    async updateOrderV2(data : { restaurant_id : number , channel_order_update_json : string  }): Promise<any> {

        let response: BaseResponseData = new BaseResponseData();

        try {     
            let ids : string = '[]';
            
            if(data.channel_order_update_json.includes('success_list')){
                const a = JSON.parse(data.channel_order_update_json);

                ids = JSON.stringify([...a.success_list, ...a.exit_list]);
            }else{
                ids = data.channel_order_update_json;
            }                        

            await this.syncChannelOrdersService.spUUpdateRestaurantOrderIds(data.restaurant_id,ids);          

            let keyGetChannelOrder = `food_channel_processor:get-channel-order-${data.restaurant_id}`;

            await this.redisService.deleteKeysWithPrefix(keyGetChannelOrder);

            await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);

        } catch (error) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError(error);
        }
        return response;
    }
}