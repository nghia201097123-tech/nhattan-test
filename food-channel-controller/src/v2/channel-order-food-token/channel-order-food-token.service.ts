import { Injectable } from '@nestjs/common';
import { grpcClientFoodChannelProcessorClientOptions } from '../grpc/client/food-channel-processor-client-options';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { BaseListResponse, BaseResponse, ChannelOrderFoodTokenServiceClient } from '../grpc/interfaces/channel-order-food-token';
import { catchError, defaultIfEmpty, delay, lastValueFrom, Observable, retryWhen, take, tap, throwError } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class ChannelOrderFoodTokenService {
  
  @Client(grpcClientFoodChannelProcessorClientOptions)
  private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;

  private channelOrderFoodTokenService: ChannelOrderFoodTokenServiceClient;

  onModuleInit() {
    this.channelOrderFoodTokenService = this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderFoodTokenServiceClient>('ChannelOrderFoodTokenService');
  }


  async createTokenGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    accessToken: string,
    username: string,
    password: string,
    xMerchantToken: string,
    deviceId: string,
    deviceBrand: string,
    quantityAccount : number

  ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.channelOrderFoodTokenService.createToken(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          access_token : accessToken,
          username: username,
          password : password,
          x_merchant_token : xMerchantToken,
          device_id : deviceId,
          device_brand : deviceBrand,
          quantity_account : quantityAccount

        }
      ).pipe(
        retryWhen((errors) =>

           errors.pipe(
              tap((err) => {
                 console.error("Error encountered during gRPC call:", err);
              }),
              delay(1000), // Retry sau 1 giây
              take(3),
              catchError((err) => {
                 console.error("Retry failed with error:", err);
                 if (err.code === 14) {
                    console.error("Service Unavailable after retries");
                    return throwError(() => new Error("Service Unavailable"));
                 }
                 return throwError(() => err);
              })
           )
        ),
        defaultIfEmpty({
          status: 400,
          message: '',
          data: null
        }),
        catchError((err) => {
           console.error("Error during gRPC call:", err);
           return throwError(() => err);
        })
     ));      
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async updateTokenGrpc(
    id: number,
    restaurantId : number,
    accessToken: string,
    username: string,
    password: string,
    xMerchantToken: string,
    deviceId: string,
    deviceBrand: string

  ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.channelOrderFoodTokenService.updateToken(
        {
          id: id,
          access_token : accessToken,
          username: username,
          password : password,
          x_merchant_token : xMerchantToken,
          device_id : deviceId,
          device_brand : deviceBrand,
          restaurant_id : restaurantId
        }
      ).pipe(
        retryWhen((errors) =>

           errors.pipe(
              tap((err) => {
                 console.error("Error encountered during gRPC call:", err);
              }),
              delay(1000), // Retry sau 1 giây
              take(3),
              catchError((err) => {
                 console.error("Retry failed with error:", err);
                 if (err.code === 14) {
                    console.error("Service Unavailable after retries");
                    return throwError(() => new Error("Service Unavailable"));
                 }
                 return throwError(() => err);
              })
           )
        ),
        defaultIfEmpty({
          status: 400,
          message: '',
          data: null
        }),
        catchError((err) => {
           console.error("Error during gRPC call:", err);
           return throwError(() => err);
        })
     ));      
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async findByIdTokenGrpc(
    id: number
  ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.channelOrderFoodTokenService.findByIdToken(
        {
          id: id
        }
      ).pipe(
        retryWhen((errors) =>

           errors.pipe(
              tap((err) => {
                 console.error("Error encountered during gRPC call:", err);
              }),
              delay(1000), // Retry sau 1 giây
              take(3),
              catchError((err) => {
                 console.error("Retry failed with error:", err);
                 if (err.code === 14) {
                    console.error("Service Unavailable after retries");
                    return throwError(() => new Error("Service Unavailable"));
                 }
                 return throwError(() => err);
              })
           )
        ),
        defaultIfEmpty({
          status: 400,
          message: '',
          data: null
        }),
        catchError((err) => {
           console.error("Error during gRPC call:", err);
           return throwError(() => err);
        })
     ));      
      
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }

  async changeConnectionGrpc(
    id: number,
    quantityAccount : number,
    metadata: Metadata

  ): Promise<BaseResponse> {

    try {            

      let data = await lastValueFrom(this.channelOrderFoodTokenService.changeConnection(
        {
          id: id,
          quantity_account : quantityAccount
        },
        metadata
      ).pipe(
        retryWhen((errors) =>

           errors.pipe(
              tap((err) => {
                 console.error("Error encountered during gRPC call:", err);
              }),
              delay(1000), // Retry sau 1 giây
              take(3),
              catchError((err) => {
                 console.error("Retry failed with error:", err);
                 if (err.code === 14) {
                    console.error("Service Unavailable after retries");
                    return throwError(() => new Error("Service Unavailable"));
                 }
                 return throwError(() => err);
              })
           )
        ),
        defaultIfEmpty({
          status: 400,
          message: '',
          data: null
        }),
        catchError((err) => {
           console.error("Error during gRPC call:", err);
           return throwError(() => err);
        })
     ));      
     
      
      return data;

    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null
      }
    }
  }


  async getListGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelOrderFoodTokenId: number,
    isConnection : number
  ): Promise<BaseListResponse> {

    try {            

      let data = await lastValueFrom(this.channelOrderFoodTokenService.getList(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          channel_order_food_token_id: channelOrderFoodTokenId,
          is_connection : isConnection
        }
      ).pipe(
        retryWhen((errors) =>

           errors.pipe(
              tap((err) => {
                 console.error("Error encountered during gRPC call:", err);
              }),
              delay(1000), // Retry sau 1 giây
              take(3),
              catchError((err) => {
                 console.error("Retry failed with error:", err);
                 if (err.code === 14) {
                    console.error("Service Unavailable after retries");
                    return throwError(() => new Error("Service Unavailable"));
                 }
                 return throwError(() => err);
              })
           )
        ),
        defaultIfEmpty({
          status: 400,
          message: '',
          data: null
        }),
        catchError((err) => {
           console.error("Error during gRPC call:", err);
           return throwError(() => err);
        })
     ));      
      
      
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
