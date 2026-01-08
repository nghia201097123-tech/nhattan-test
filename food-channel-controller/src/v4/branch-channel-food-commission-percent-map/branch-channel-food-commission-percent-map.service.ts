import { Injectable } from "@nestjs/common";
import { grpcClientFoodChannelProcessorClientOptions } from "../grpc/client/food-channel-processor-client-options";
import { Client, ClientGrpc } from "@nestjs/microservices";
import { BaseResponse, ListV2BaseResponse, SettingCommissionServiceClient } from "../grpc/interfaces/branch-channel-food-commission-percent-map";
import { catchError, defaultIfEmpty, lastValueFrom, retry, throwError, timer } from "rxjs";

@Injectable()
export class BranchChannelFoodCommissionPercentMapService {

    @Client(grpcClientFoodChannelProcessorClientOptions)
    private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;
  
    private settingCommissionService: SettingCommissionServiceClient;
  
  
    onModuleInit() {
      this.settingCommissionService = this.grpcClientFoodChannelProcessorClientOptions.getService<SettingCommissionServiceClient>('SettingCommissionService');
  
    }

    async updateSettingCommissionPercentGrpc(
        id: number,
        restaurantId: number,
        restaurantBrandId: number,
        branchId: number,
        channelOrderFoodId: number,
        percent: number , 
        channelOrderFoodTokenId : number): Promise<BaseResponse> {

        try {            
    
          let data = await lastValueFrom(this.settingCommissionService.updateSettingCommissionPercent(
            {
              id : id,
              restaurant_id: restaurantId,
              restaurant_brand_id: restaurantBrandId,
              branch_id: branchId,
              channel_order_food_id : channelOrderFoodId,
              percent : percent,
              channel_order_food_token_id : channelOrderFoodTokenId
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
  
    async getListCommissionPercentSettingV2Grpc( 
      restaurantId: number,
      restaurantBrandId: number,
      branchId : number,
      channelOrderFoodId : number,
      channelOrderFoodTokenId : number
    ): Promise<ListV2BaseResponse> {
      try {            
  
        let data = await lastValueFrom(this.settingCommissionService.getListCommissionPercentSettingV2(
          {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id : branchId,
            channel_order_food_id : channelOrderFoodId,
            channel_order_food_token_id : channelOrderFoodTokenId
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
