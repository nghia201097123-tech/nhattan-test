import { Injectable } from '@nestjs/common';
import { grpcClientFoodChannelProcessorClientOptions } from '../grpc/client/food-channel-processor-client-options';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { BaseResponse, OrderChannelOrderFoodServiceClient, ResultOrderDetailResponse } from '../grpc/interfaces/order-channel-order-food';
import { catchError, defaultIfEmpty,lastValueFrom, retry, throwError, timer } from 'rxjs';

@Injectable()
export class SyncChannelOrdersService {
  
  // -------- 
  @Client(grpcClientFoodChannelProcessorClientOptions)
  private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;

  private orderChannelOrderFoodService: OrderChannelOrderFoodServiceClient;

  onModuleInit() {
    this.orderChannelOrderFoodService = this.grpcClientFoodChannelProcessorClientOptions.getService<OrderChannelOrderFoodServiceClient>('OrderChannelOrderFoodService');
  }

   //------------------ foodChannelValidatorService

   async getOrderDetailsGrpc(channelOrderId : number , channelOrderFoodId : number , orderId : string): Promise<ResultOrderDetailResponse> {

    try {            

      let data = await lastValueFrom(this.orderChannelOrderFoodService.getOrderDetails(
        {
            channel_order_id: channelOrderId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderId
        }
      ).pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty({
          status: 400,
          message: "Error call grpc",
          data: null
        }),
        catchError((err) => {
          console.error("Final error after retries during gRPC call:", err);
          return throwError(() => err);
        })
      )
    );
      
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async updateOrderGrpc(channelOrderId : number , restaurantOrderId : number ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.orderChannelOrderFoodService.updateOrder(
        {
            channel_order_id: channelOrderId,
            restaurant_order_id: restaurantOrderId
        }
      ).pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty({
          status: 400,
          message: "Error call grpc",
          data: null
        }),
        catchError((err) => {
          console.error("Final error after retries during gRPC call:", err);
          return throwError(() => err);
        })
      )
    );
      
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async getListChannelOrderGrpc(restaurantId : number , channelOrderIds : string ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.orderChannelOrderFoodService.getListChannelOrder(
        {
          restaurant_id: restaurantId,
          channel_order_ids: channelOrderIds
        }
      ).pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty({
          status: 400,
          message: "Error during gRPC call",
          data: null
        }), catchError((err) => {
          console.error("Final error after retries during gRPC call:", err);
          return throwError(() => err);
        }
        ))); 
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async updateOrderV2Grpc(restaurantId : number , channelOderUpdateJson : string ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.orderChannelOrderFoodService.updateOrderV2(
        {
          restaurant_id: restaurantId,
          channel_order_update_json: channelOderUpdateJson
        }
      ).pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty({
          status: 400,
          message: "Error call grpc",
          data: null
        }),
        catchError((err) => {
          console.error("Final error after retries during gRPC call:", err);
          return throwError(() => err);
        })
      )
    );
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }
}
