import { Injectable } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { catchError, defaultIfEmpty, delay, lastValueFrom, Observable, retry, retryWhen, take, tap, throwError, timer } from 'rxjs';
import { grpcClientFoodChannelValidtor } from '../grpc/client/food-channel-validator-client-option';
import { BaseDataResponse, BaseResponse, FoodChannelValidatorServiceClient } from '../grpc/interfaces/food-channel-validator';
import { grpcClientFoodChannelProcessorClientOptions } from '../grpc/client/food-channel-processor-client-options';
import { BaseEmptyResponse, BillAppFoodBaseResponse, ChannelOrderFoodServiceClient, ListBaseResponse, ListBranchChannelOrderFoodResponse, ListFoodChannelOrderFoodResponse, ListFoodToppingResponse } from '../grpc/interfaces/channel-order-food';
import { OrderChannelOrderFoodServiceClient } from '../grpc/interfaces/order-channel-order-food';
import { ChannelFoodOrderReportResultResponse, ChannelFoodReportResultResponse, ChannelFoodReportSumaryDataResultResponse, ChannelFoodRevenueSumaryBaseResponse, ChannelOrderFoodReportServiceClient, ChannelOrderHistoryBaseResponse, EarningSumaryReportResultResponse } from '../grpc/interfaces/channel-order-food-report';
import { BatchConfirmChannelOrderResponseResultResponse, ChannelOrderServiceClient, OrderBaseResponse, ResultBaseResponse } from '../grpc/interfaces/channel-order';
import { FoodChannelSettingServiceClient } from '../grpc/interfaces/food-channel-setting';

@Injectable()
export class ChannelOrderFoodService {

  @Client(grpcClientFoodChannelValidtor)
  private readonly grpcClientFoodChannelValidtor: ClientGrpc;

  private foodChannelValidatorService: FoodChannelValidatorServiceClient;
  // -------- 
  @Client(grpcClientFoodChannelProcessorClientOptions)
  private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;

  private channelOrderFoodService: ChannelOrderFoodServiceClient;

  private orderChannelOrderFoodService: OrderChannelOrderFoodServiceClient;

  private channelOrderFoodReportService: ChannelOrderFoodReportServiceClient;

  private channelOrderService: ChannelOrderServiceClient;

  private foodChannelSettingService: FoodChannelSettingServiceClient;


  onModuleInit() {
    this.foodChannelValidatorService = this.grpcClientFoodChannelValidtor.getService<FoodChannelValidatorServiceClient>('FoodChannelValidatorService');
    this.channelOrderFoodService = this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderFoodServiceClient>('ChannelOrderFoodService');
    this.orderChannelOrderFoodService = this.grpcClientFoodChannelProcessorClientOptions.getService<OrderChannelOrderFoodServiceClient>('OrderChannelOrderFoodService');
    this.channelOrderFoodReportService = this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderFoodReportServiceClient>('ChannelOrderFoodReportService');
    this.channelOrderService = this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderServiceClient>('ChannelOrderService');
    this.foodChannelSettingService = this.grpcClientFoodChannelProcessorClientOptions.getService<FoodChannelSettingServiceClient>('FoodChannelSettingService');
  }

  //------------------ foodChannelValidatorService

  async checkFoodChannelValidatorRedisGrpc(restaurantId: number, restaurantBrandId: number, branchId: number): Promise<BaseDataResponse> {

    try {

      let data = await lastValueFrom(this.foodChannelValidatorService.checkFoodChannelValidatorRedis(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId
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

  //------------------ channelOrderFoodService


  async findByIdGrpc(
    id: number
  ): Promise<BaseResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.findById(
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


  async getListChannelOrderFoodGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    isConnect: number,
    keySearch: string
  ): Promise<ListBaseResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.getList(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          is_connect: isConnect,
          key_search: keySearch
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

  async getFoodsChannelOrderFoodGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelBranchId: string
  ): Promise<ListFoodChannelOrderFoodResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.getFoodsChannelOrderFood(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          channel_branch_id: channelBranchId
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
        data: []
      }
    }
  }

  async getFoodToppingsGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelBranchId: string
  ): Promise<ListFoodToppingResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.getFoodToppings(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          channel_branch_id: channelBranchId
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
          data: []
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
        data: []
      }
    }
  }

  async updateFoodPrices(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelBranchId: string,
    foods: [{
      id: string,
      price: string
    }]
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.updateFoodPrices(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          channel_branch_id: channelBranchId,
          foods: foods
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
          data: {}
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
        data: {}
      }
    }
  }

  async getBranchesChannelOrderFoodGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number
  ): Promise<ListBranchChannelOrderFoodResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.getBranchesChannelOrderFood(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId
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
          data: []
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
        data: []
      }
    }
  }

  async getChannelBranchesOfTokenToConnectionGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number
  ): Promise<ListBranchChannelOrderFoodResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.getChannelBranchesOfTokenToConnection(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id: channelOrderFoodId
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
          data: []
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
        data: []
      }
    }
  }

  async syncChannelBranchesOfTokenToConnectionGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number
  ): Promise<ListBranchChannelOrderFoodResponse> {

    try {
      let data = await lastValueFrom(this.channelOrderFoodService.syncBranches(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
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


  async syncAssignBranchGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    branch_maps: string
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.syncAssignBranch(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          channel_order_food_id: channelOrderFoodId,
          branch_maps: branch_maps
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
          data: {}
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
        data: {}
      }
    }
  }

  async syncAssignMultipleChannelBranchGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    branchMaps: string
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.syncAssignMultipleChannelBranch(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id: channelOrderFoodId,
          branch_maps: branchMaps
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
          data: {}
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
        data: {}
      }
    }
  }

  async orderRefreshGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrders: string
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.orderRefresh(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_orders: channelOrders
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
          data: {}
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
        data: {}
      }
    }
  }


  async comfirmChannelOrderGrpc(
    restaurantId: number,
    channelOrderId: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.comfirmChannelOrder(
        {
          restaurant_id: restaurantId,
          channel_order_id: channelOrderId
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


  //------------------ orderChannelOrderFoodService
  async getDetailBillAppFoodGrpc(
    channelOrderFoodId: number,
    channelOrderFoodCode: string
  ): Promise<BillAppFoodBaseResponse> {

    try {

      let data = await lastValueFrom(this.orderChannelOrderFoodService.getDetailBillAppFood(
        {
          channel_order_food_id: channelOrderFoodId,
          channel_order_food_code: channelOrderFoodCode
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
          data: []
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
        data: []
      }
    }
  }


  //------------------ channelOrderFoodReportService

  async getListChannelOrderHistoryGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    foodChannelId: number,
    fromDate: string,
    toDate: string
  ): Promise<ChannelOrderHistoryBaseResponse> {

    try {


      let data = await lastValueFrom(this.channelOrderFoodReportService.getListChannelOrderHistory(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          food_channel_id: foodChannelId,
          from_date: fromDate,
          to_date: toDate
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

  async getChannelFoodRevenueSumaryReportGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    foodChannelId: number,
    hourToTakeReport: number,
    groupType: number,
    fromDate: string,
    toDate: string
  ): Promise<ChannelFoodRevenueSumaryBaseResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodReportService.getChannelFoodRevenueSumaryReport(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          food_channel_id: foodChannelId,
          hour_to_take_report: hourToTakeReport,
          group_type: groupType,
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

  async getChannelFoodReportGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    hourToTakeReport: number,
    fromDate: string,
    toDate: string,
    keySearch: string,
    limit: number,
    offset: number,
  ): Promise<ChannelFoodReportResultResponse> {

    try {
      let data = await lastValueFrom(this.channelOrderFoodReportService.getChannelFoodReport(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          hour_to_take_report: hourToTakeReport,
          from_date_string: fromDate,
          to_date_string: toDate,
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
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelBranchId: string,
    fromDate: string,
    toDate: string,
  ): Promise<EarningSumaryReportResultResponse> {

    try {
      let data = await lastValueFrom(this.channelOrderFoodReportService.getEarningSumaryReport(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_branch_id: channelBranchId,
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

  async getChannelFoodSumaryDataReportGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    foodChannelId: number,
    hourToTakeReport: number,
    groupType: number,
    fromDate: string,
    toDate: string
  ): Promise<ChannelFoodReportSumaryDataResultResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodReportService.getChannelFoodSumaryDataReport(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          food_channel_id: foodChannelId,
          hour_to_take_report: hourToTakeReport,
          group_type: groupType,
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

  async getChannelFoodOrderReportGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    hourToTakeReport: number,
    fromDate: string,
    toDate: string,
    keySearch: string,
    offset: number,
    limit: number,
  ): Promise<ChannelFoodOrderReportResultResponse> {

    try {
      let data = await lastValueFrom(this.channelOrderFoodReportService.getChannelFoodOrdersReport(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id: channelOrderFoodId,
          hour_to_take_report: hourToTakeReport,
          from_date: fromDate,
          to_date: toDate,
          offset: offset,
          limit: limit,
          key_search: keySearch,
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

  ////------------------ channelOrderService

  async getOrderDetailGrpc(
    id: number,
    isAppFood: number,
    restaurantId: number
  ): Promise<OrderBaseResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.getOrderDetail(
        {
          id: id,
          is_app_food: isAppFood,
          restaurant_id: restaurantId
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

  async getOrdersGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    customerOrderStatus: string,
    isHaveRestaurantOrder: number,
    isAppFood: number,
    isActive: number,
    tokens: string,
    isUseKafka
  ): Promise<ResultBaseResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.getOrders(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id: channelOrderFoodId,
          customer_order_status: customerOrderStatus,
          is_have_restaurant_order: isHaveRestaurantOrder,
          is_app_food: isAppFood,
          is_active: isActive,
          tokens: tokens,
          is_use_kafka: isUseKafka
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

  async resetChannelOrderGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.resetChannelOrder(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
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

  async syncChannelOrderHistoryGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    tokens: string
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.syncChannelOrderHistory(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
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
          message: 'Error encountered during gRPC call',
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

  async handleCompleteChannelOrderGrpc(
    restaurantId: number,
    id: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.handleCompleteChannelOrder(
        {
          restaurant_id: restaurantId,
          id: id
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
          message: 'Error encountered during gRPC call',
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

  async handleCancelChannelOrderGrpc(
    restaurantId: number,
    id: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.handleCancelChannelOrder(
        {
          restaurant_id: restaurantId,
          id: id
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
          message: 'Error encountered during gRPC call',
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

  // foodChannelSettingService


  async updateSettingFoodChannelBranchGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    quantiySlotSHF: number,
    quantiySlotGRF: number,
    quantiySlotBEF: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.foodChannelSettingService.updateSettingFoodChannelBranch(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          quantity_slot_SHF: quantiySlotSHF,
          quantity_slot_GRF: quantiySlotGRF,
          quantity_slot_BEF: quantiySlotBEF
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
          message: 'Error encountered during gRPC call',
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


  async updateSettingFoodChannelRestaurantBrandGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    quantityAccountSHF: number,
    quantityAccountGRF: number,
    quantityAccountBEF: number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.foodChannelSettingService.updateSettingFoodChannelRestaurantBrand(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          quantity_account_SHF: quantityAccountSHF,
          quantity_account_GRF: quantityAccountGRF,
          quantity_account_BEF: quantityAccountBEF
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
          message: 'Error encountered during gRPC call',
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

  async deleteRedisFoodChannelFoodTechresMapGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId:number
  ): Promise<BaseEmptyResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderFoodService.deleteRedisFoodChannelFoodTechresMap(
        {
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id:channelOrderFoodId
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
          message: 'Error encountered during gRPC call',
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

  async batchConfirmChannelOrderGrpc(
    restaurantId: number,
    branchId: number,
    ids:string
  ): Promise<BatchConfirmChannelOrderResponseResultResponse> {

    try {

      let data = await lastValueFrom(this.channelOrderService.batchConfirmChannelOrder(
        {
          restaurant_id : restaurantId,
          branch_id: branchId,
          ids:ids
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
          message: 'Error encountered during gRPC call',
          data: '[]'
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
        data: '[]'
      }
    }
  }

  async updateCancelPrintOrdersGrpc(
    restaurantId: number,
    branchId: number,
    ids:string
  ): Promise<any> {

    try {

      let data = await lastValueFrom(this.channelOrderService.updateCancelPrintOrders(
        {
          restaurant_id : restaurantId,
          branch_id: branchId,
          ids:ids
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
          message: 'Error encountered during gRPC call',
          data: '[]'
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
        data: '[]'
      }
    }
  }
}
