// channel-order-food-api.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, defaultIfEmpty,lastValueFrom, retry, throwError, timer } from 'rxjs';
import { Repository } from 'typeorm';
import { ChannelOrderFoodApiEntity } from './entity/channel-order-food-api.entity';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { grpcClientFoodChannelConnector } from '../grpc/client/food-channel-connector-client-options';
import { ChannelOrderFoodApiServiceClient, CheckTokenBEFBaseResponse, CheckTokenGRFBaseResponse, EarningSumaryReportResultResponse, EmptyBaseResponse, ListBranchBaseResponse, ListChannelBranchesResponse, ListFoodBaseResponse, ListFoodToppingResponse, ListOrderStatusBaseResponse, ResultBaseResponse, SyncChannelOrderHistoryBaseResponse } from '../grpc/interfaces/channel-order-food-api';
import { grpcClientSyncConnectorChannelOrderShf } from '../grpc/client/sync-connector-channel-order-shf-client-options';
import { grpcClientSyncConnectorChannelOrderGrf } from '../grpc/client/sync-connector-channel-order-grf-client-options';
import { grpcClientSyncConnectorChannelOrderBef } from '../grpc/client/sync-connector-channel-order-bef-client-options';
import { grpcClientSyncConnectorChannelOrderCnvl } from '../grpc/client/sync-connector-channel-order-cnvl-client-options';

@Injectable()
export class ChannelOrderFoodApiService {

  @Client(grpcClientFoodChannelConnector)
  private readonly grpcClientFoodChannelConnector: ClientGrpc;

  private channelOrderFoodApiService: ChannelOrderFoodApiServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderShf)
  private readonly grpcClientSyncConnectorChannelOrderShf: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderShfService: ChannelOrderFoodApiServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderGrf)
  private readonly grpcClientSyncConnectorChannelOrderGrf: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderGrfService: ChannelOrderFoodApiServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderBef)
  private readonly grpcClientSyncConnectorChannelOrderBef: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderBefService: ChannelOrderFoodApiServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderCnvl)
  private readonly grpcClientSyncConnectorChannelOrderCnvl: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderCnvlService: ChannelOrderFoodApiServiceClient;

  constructor(
    @InjectRepository(ChannelOrderFoodApiEntity)
    private readonly channelOrderFoodApiRepository: Repository<ChannelOrderFoodApiEntity>,
  ) { }

  onModuleInit() {
    this.channelOrderFoodApiService = this.grpcClientFoodChannelConnector.getService<ChannelOrderFoodApiServiceClient>('ChannelOrderFoodApiService');
    this.grpcClientSyncConnectorChannelOrderShfService =
    this.grpcClientSyncConnectorChannelOrderShf.getService<ChannelOrderFoodApiServiceClient>(
      "ChannelOrderFoodApiService"
    );
  this.grpcClientSyncConnectorChannelOrderGrfService =
    this.grpcClientSyncConnectorChannelOrderGrf.getService<ChannelOrderFoodApiServiceClient>(
      "ChannelOrderFoodApiService"
    );
  this.grpcClientSyncConnectorChannelOrderBefService =
    this.grpcClientSyncConnectorChannelOrderBef.getService<ChannelOrderFoodApiServiceClient>(
      "ChannelOrderFoodApiService"
    );
  this.grpcClientSyncConnectorChannelOrderCnvlService =
    this.grpcClientSyncConnectorChannelOrderCnvl.getService<ChannelOrderFoodApiServiceClient>(
      "ChannelOrderFoodApiService"
    );
  }

  async findBychannelOrderFoodIdAndType(channel_order_food_id: number, type: number): Promise<ChannelOrderFoodApiEntity> {
    return await this.channelOrderFoodApiRepository.findOne({
      where: {
        channel_order_food_id,
        type
      },
    });
  }

  async getFoodsGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodBaseResponse> {
    try {

      let data = await lastValueFrom(this.channelOrderFoodApiService.getFoods(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodsSHFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderShfService.getFoods(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodsGRFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.getFoods(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodsBEFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.getFoods(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodsCNVLGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderCnvlService.getFoods(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodToppingsGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodToppingResponse> {
    try {

      let data = await lastValueFrom(this.channelOrderFoodApiService.getFoodToppings(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodToppingsSHFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodToppingResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderShfService.getFoodToppings(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodToppingsGRFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodToppingResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.getFoodToppings(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async getFoodToppingsBEFGrpc(url: string, accessToken: string, channelBranchId: string, merchantId: string, channelOrderFoodId: number , urlGetAccountInformationDetail : string ): Promise<ListFoodToppingResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.getFoodToppings(
        {
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_get_account_information_detail : urlGetAccountInformationDetail
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
          data: []
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
        data: []
      }
    }
  }

  async updatePriceFoodsShfGrpc(foods: string, url: string, accessToken: string, channelBranchId: number): Promise<EmptyBaseResponse> {
    try {

      let data = await lastValueFrom(this.channelOrderFoodApiService.updatePriceFoodsShf(
        {
          foods: foods,
          url: url,
          access_token: accessToken,
          channel_branch_id: channelBranchId
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
          data: {}
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
        data: {}
      }
    }
  }

  async updatePriceFoodsBefGrpc(foods: string, urlFoodDetail: string, urlFoodUpdate: string, accessToken: string, channelBranchId: string, merchantId: string): Promise<EmptyBaseResponse> {
    try {

      let data = await lastValueFrom(this.channelOrderFoodApiService.updatePriceFoodsBef(
        {
          foods: foods,
          url_food_detail: urlFoodDetail,
          url_food_update: urlFoodUpdate,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId
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
          data: {}
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
        data: {}
      }
    }
  }

  async getBranchesGrpc(url: string, accessToken: string, username: string, channelOrderFoodId: number): Promise<ListBranchBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderShfService.getBranches(
        {
          url: url,
          access_token: accessToken,
          username: username,
          channel_order_food_id: channelOrderFoodId
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
          data: []
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
        data: []
      }
    }
  }

  async checkTokenGrfGrpc(
    urlLogout: string,
    urlUpdateDevice: string,
    username: string,
    password: string,
    deviceId: string,
    deviceBrand: string
  ): Promise<CheckTokenGRFBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.checkTokenGrf(
        {
          url_logout: urlLogout,
          url_update_device: urlUpdateDevice,
          username: username,
          password: password,
          device_id: deviceId,
          device_brand: deviceBrand
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

  async checkTokenBefGrpc(
    urlLogin: string,
    username: string,
    password: string
  ): Promise<CheckTokenBEFBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.checkTokenBef(
        {
          url_login: urlLogin,
          username: username,
          password: password
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

  // async updateOrderStatusGrpc(
  //   channelOrders: string
  // ): Promise<ListOrderStatusBaseResponse> {
  //   try {

  //     let data = await lastValueFrom(this.channelOrderFoodApiService.updateOrderStatus(
  //       {
  //         channel_orders: channelOrders
  //       }
  //     ).pipe(
  //       retry({
  //         count: 3,
  //         delay: (error, retryCount) => {
  //           console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
  //           return timer(retryCount * 1000);
  //         },
  //       }),
  //       defaultIfEmpty({
  //         status: 400,
  //         message: "Error during gRPC call",
  //         data: null
  //       }), catchError((err) => {
  //         console.error("Final error after retries during gRPC call:", err);
  //         return throwError(() => err);
  //       }
  //       )));


  //     return data;
  //   } catch (error) {
  //     return {
  //       status: 400,
  //       message: error,
  //       data: null
  //     }
  //   }
  // }

  async reconnectionTokenGRFGrpc(
    urlLogin: string,
    urlUpdateDevice: string,
    username: string,
    password: string,
    deviceId: string,
    deviceBrand: string
  ): Promise<CheckTokenGRFBaseResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.reconnectionTokenGrf(
        {
          url_login: urlLogin,
          url_update_device: urlUpdateDevice,
          username: username,
          password: password,
          device_id: deviceId,
          device_brand: deviceBrand
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

  async reconnectionTokenBefGrpc(
    urlLogin: string,
    username: string,
    password: string
  ): Promise<CheckTokenBEFBaseResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.reconnectionTokenBef(
        {
          url_login: urlLogin,
          username: username,
          password: password
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

  // async checkTokenAllFoodChannelGrpc(
  //   tokens: string
  // ): Promise<ResultBaseResponse> {
  //   try {
  //     let data = await lastValueFrom(this.channelOrderFoodApiService.checkTokenAllFoodChannel(
  //       {
  //         tokens: tokens

  //       }
  //     ).pipe(
  //       retry({
  //         count: 3,
  //         delay: (error, retryCount) => {
  //           console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
  //           return timer(retryCount * 1000);
  //         },
  //       }),
  //       defaultIfEmpty({
  //         status: 400,
  //         message: "Error during gRPC call",
  //         data: null
  //       }), catchError((err) => {
  //         console.error("Final error after retries during gRPC call:", err);
  //         return throwError(() => err);
  //       }
  //       )));


  //     return data;
  //   } catch (error) {
  //     return {
  //       status: 400,
  //       message: error,
  //       data: null
  //     }
  //   }
  // }

  // async getChannelBranchesGrpc(
  //   restaurantBrandId : number,
  //   tokens: string
  // ): Promise<ListChannelBranchesResponse> {
  //   try {
  //     let data = await lastValueFrom(this.channelOrderFoodApiService.getChannelBranches(
  //       {
  //         restaurant_brand_id : restaurantBrandId,
  //         tokens: tokens
  //       }
  //     ).pipe(
  //       retry({
  //         count: 3,
  //         delay: (error, retryCount) => {
  //           console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
  //           return timer(retryCount * 1000);
  //         },
  //       }),
  //       defaultIfEmpty({
  //         status: 400,
  //         message: "Error during gRPC call",
  //         data: []
  //       }), catchError((err) => {
  //         console.error("Final error after retries during gRPC call:", err);
  //         return throwError(() => err);
  //       }
  //       )));


  //     return data;
  //   } catch (error) {
  //     return {
  //       status: 400,
  //       message: error,
  //       data: []

  //     }

  //   }

  // }

  async getChannelBranchesSHFGrpc(
    restaurantBrandId : number,
    tokens: string
  ): Promise<ListChannelBranchesResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderShfService.getChannelBranches(
        {
          restaurant_brand_id : restaurantBrandId,
          tokens: tokens
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
          data: []
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
        data: []

      }

    }

  }

  async getChannelBranchesGRFGrpc(
    restaurantBrandId : number,
    tokens: string
  ): Promise<ListChannelBranchesResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.getChannelBranches(
        {
          restaurant_brand_id : restaurantBrandId,
          tokens: tokens
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
          data: []
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
        data: []

      }

    }

  }

  async getChannelBranchesBEFGrpc(
    restaurantBrandId : number,
    tokens: string
  ): Promise<ListChannelBranchesResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.getChannelBranches(
        {
          restaurant_brand_id : restaurantBrandId,
          tokens: tokens
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
          data: []
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
        data: []

      }

    }

  }

  async getChannelBranchesCNVLGrpc(
    restaurantBrandId : number,
    tokens: string
  ): Promise<ListChannelBranchesResponse> {
    try {
      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderCnvlService.getChannelBranches(
        {
          restaurant_brand_id : restaurantBrandId,
          tokens: tokens
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
          data: []
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
        data: []

      }

    }

  }

  async confirmChannelOrderSHFGrpc(
    urlComfirmOrder: string,
    accessToken: string,
    channelBranchId: string,
    merchantId: string,
    channelOrderFoodId: number,
    urlLogin: string,
    urlUpdateDevice: string,
    urlGetBranchDetail: string,
    username: string,
    password: string,
    orderId: string,
    userId: number,
    deviceId : string,
    deviceBrand : string

  ): Promise<EmptyBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderShfService.confirmChannelOrder(
        {
          url_comfirm_order: urlComfirmOrder,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_login: urlLogin,
          url_update_device: urlUpdateDevice,
          url_get_branch_detail: urlGetBranchDetail,
          username: username,
          password: password,
          order_id: orderId,
          user_id: userId,
          device_id : deviceId,
          device_brand : deviceBrand
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

  async confirmChannelOrderGRFGrpc(
    urlComfirmOrder: string,
    accessToken: string,
    channelBranchId: string,
    merchantId: string,
    channelOrderFoodId: number,
    urlLogin: string,
    urlUpdateDevice: string,
    urlGetBranchDetail: string,
    username: string,
    password: string,
    orderId: string,
    userId: number,
    deviceId : string,
    deviceBrand : string

  ): Promise<EmptyBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.confirmChannelOrder(
        {
          url_comfirm_order: urlComfirmOrder,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_login: urlLogin,
          url_update_device: urlUpdateDevice,
          url_get_branch_detail: urlGetBranchDetail,
          username: username,
          password: password,
          order_id: orderId,
          user_id: userId,
          device_id : deviceId,
          device_brand : deviceBrand
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

  async confirmChannelOrderBEFGrpc(
    urlComfirmOrder: string,
    accessToken: string,
    channelBranchId: string,
    merchantId: string,
    channelOrderFoodId: number,
    urlLogin: string,
    urlUpdateDevice: string,
    urlGetBranchDetail: string,
    username: string,
    password: string,
    orderId: string,
    userId: number,
    deviceId : string,
    deviceBrand : string

  ): Promise<EmptyBaseResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderBefService.confirmChannelOrder(
        {
          url_comfirm_order: urlComfirmOrder,
          access_token: accessToken,
          channel_branch_id: channelBranchId,
          merchant_id: merchantId,
          channel_order_food_id: channelOrderFoodId,
          url_login: urlLogin,
          url_update_device: urlUpdateDevice,
          url_get_branch_detail: urlGetBranchDetail,
          username: username,
          password: password,
          order_id: orderId,
          user_id: userId,
          device_id : deviceId,
          device_brand : deviceBrand
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

  async getEarningSumaryReportGrpc(
    tokens: string,
    fromDate: string,
    toDate: string,
  ): Promise<EarningSumaryReportResultResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.getEarningSumaryReport(
        {
          tokens: tokens,
          from_date: fromDate,
          to_date: toDate
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

  async getEarningSumaryReportV2Grpc(
    tokens: string,
    fromDate: string,
    toDate: string,
  ): Promise<EarningSumaryReportResultResponse> {
    try {

      let data = await lastValueFrom(this.grpcClientSyncConnectorChannelOrderGrfService.getEarningSumaryReportV2(
        {
          tokens: tokens,
          from_date: fromDate,
          to_date: toDate
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
}
