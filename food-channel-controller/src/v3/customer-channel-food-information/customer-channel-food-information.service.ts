import { Injectable } from '@nestjs/common';
import { grpcClientFoodChannelProcessorClientOptions } from '../grpc/client/food-channel-processor-client-options';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { ChannelOrderFoodReportServiceClient, CustomerChannelFoodInformationReportBaseResponse } from '../grpc/interfaces/channel-order-food-report';
import { catchError, defaultIfEmpty, lastValueFrom,retry, throwError, timer } from 'rxjs';

@Injectable()
export class CustomerChannelFoodInformationService {

    @Client(grpcClientFoodChannelProcessorClientOptions)
    private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;
  
    private channelOrderFoodReportService: ChannelOrderFoodReportServiceClient;
  
  
    onModuleInit() {
    
    this.channelOrderFoodReportService = this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderFoodReportServiceClient>('ChannelOrderFoodReportService');
  
    }

    async getCustomerChannelFoodInformationReportGrpc(
        restaurantId: number,
        restaurantBrandId: number,
        branchIds: string,
        channelOrderFoodId: number,
        fromDateString: string,
        toDateString: string,
        keySearch: string,
        limit: number,
        offset: number
      ): Promise<CustomerChannelFoodInformationReportBaseResponse> {
      
      try {   
      
        let data = await lastValueFrom(this.channelOrderFoodReportService.getCustomerChannelFoodInformationReport(
          {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_ids: branchIds,
            channel_order_food_id: channelOrderFoodId,
            from_date_string: fromDateString,
            to_date_string: toDateString,
            key_search: keySearch,
            limit: limit,
            offset: offset
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
