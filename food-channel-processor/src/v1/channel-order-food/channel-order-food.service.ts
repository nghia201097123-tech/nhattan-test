import { forwardRef, Inject, HttpStatus, Injectable } from "@nestjs/common";
import { Client, ClientGrpc } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import {
  catchError,
  defaultIfEmpty,
  lastValueFrom,
  retry,
  throwError,
  timer,
} from "rxjs";
import { ExceptionStoreProcedure } from "src/utils.common/utils.exception.common/utils.store-procedure-exception.common";
import { StoreProcedureResult } from "src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common";
import { Repository } from "typeorm";
import { grpcClientCustomerOrderOnline } from "../grpc/client/customer-order-online-client-options";
import { grpcClientOrderOnline } from "../grpc/client/order-client-options";
import {
  BaseDetailResponse,
  BaseListResponse,
  CustomerOrderForChannelFoodServiceClient,
} from "../grpc/interfaces/customer-order-for-channel-food";
import { ChannelOrderFoodEntity } from "./entity/channel-order-food.entity";
import { ChannelOrderFoodDataModel } from "./model/channel-order-food.data.model";
import { StoreProcedureOutputResultInterface } from "src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common";
import { ChannelOrderHistoryOutputDataModel } from "./model/channel-order-history.output.data.model";
import { ChannelOrderHistoryDataModel } from "./model/channel-order-history.data.model";
import { StoreProcedureResultOutput } from "src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result-output-common";
import { ChannelFoodRevenueSumaryDataModel } from "./model/channel-food-revenue-sumary.data.model";
import { ChannelFoodRevenueSumaryOutputDataModel } from "./model/channel-food-revenue-sumary.output.data.model";
import { ChannelOrderCompleteDataModel } from "./model/channel-order-complete.data.model";
import { ChannelFoodMenuReportDataModel } from "./model/channel-food-menu-report.data.model";
import { ChannelFoodMenuReportOutputDataModel } from "./model/channel-food-menu-report.output.data.model";
import { ChannelOrderSchemaService } from "../channel-order-schema/channel-order-schema.service";
import { ChannelOrderFoodTokenService } from "../channel-order-food-token/channel-order-food-token.service";
import { grpcClientSyncConnectorChannelOrderShf } from "../grpc/client/sync-connector-channel-order-shf-client-options";
import { grpcClientSyncConnectorChannelOrderGrf } from "../grpc/client/sync-connector-channel-order-grf-client-options";
import { grpcClientSyncConnectorChannelOrderBef } from "../grpc/client/sync-connector-channel-order-bef-client-options";
import {
  HealthCheckGRPCResponse,
  SyncConnectorChannelOrderServiceClient,
} from "../grpc/interfaces/sync-connector-channel-order";
import {
  BaseResponse,
  OrderServiceClient,
} from "../grpc/interfaces/complete-order";
import { ChannelFoodSumaryDataModel } from "./model/channel-food-sumary-data.data.model";
import { ChannelFoodOrderReportModel } from "./model/channel-food-order-report.data.model";
import { RedisService } from "src/redis/redis.service";
import { grpcClientDashboard } from "../grpc/client/dashboard-client-option";
import {
  BranchFoodMapFoodChannelServiceClient,
  BranchFoodMapInformationResponseBaseResponse,
} from "../grpc/interfaces/branch-food-map-food-channel";
import { CustomElasticsearchService } from "../elasticsearch/elasticsearch.service";
import {
  BaseConfirmOrderChannelResponse,
  ConfirmOrderChannelServiceClient,
} from "../grpc/interfaces/confirm-order-channel";
import { FoodTechres } from "./response/food-techres.response";
import { branchFoodTechresMap } from "./response/branch_food-techres-map.response";
import { FoodChannelFoodTechresMap } from "./response/food-channel-food-techres-map.response copy";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum/utils.channel-order-food-number";
import { ChannelOrderNewDataModel } from "./model/channel-order-new.data.model";
import { ChannelOrderByIdsDataModel } from "../sync-channel-order/model/channel-order-by-ids.data.model";
import { ChannelOrderByIdsResponse } from "../sync-channel-order/response/channel-order-by-ids.response";

@Injectable()
export class ChannelOrderFoodService {
  @Client(grpcClientCustomerOrderOnline)
  private readonly grpcClientCustomerOrderOnline: ClientGrpc;

  private customerOrderForChannelFoodService: CustomerOrderForChannelFoodServiceClient;

  @Client(grpcClientOrderOnline)
  private readonly grpcClientOrderOnline: ClientGrpc;

  private orderService: OrderServiceClient;

  private confirmOrderChannelService: ConfirmOrderChannelServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderShf)
  private readonly grpcClientSyncConnectorChannelOrderShf: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderShfService: SyncConnectorChannelOrderServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderGrf)
  private readonly grpcClientSyncConnectorChannelOrderGrf: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderGrfService: SyncConnectorChannelOrderServiceClient;

  @Client(grpcClientSyncConnectorChannelOrderBef)
  private readonly grpcClientSyncConnectorChannelOrderBef: ClientGrpc;

  private grpcClientSyncConnectorChannelOrderBefService: SyncConnectorChannelOrderServiceClient;

  @Client(grpcClientDashboard)
  private readonly grpcClientDashboard: ClientGrpc;

  private grpcClientBranchFoodMapFoodChannelService: BranchFoodMapFoodChannelServiceClient;

  constructor(
    @InjectRepository(ChannelOrderFoodEntity)
    private readonly channelOrderFoodRepository: Repository<ChannelOrderFoodEntity>,
    private readonly channelOrderSchemaService: ChannelOrderSchemaService,
    private readonly channelOrderFoodTokenService: ChannelOrderFoodTokenService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService,
    private readonly elasticsearchService: CustomElasticsearchService
  ) {}
  onModuleInit() {
    this.customerOrderForChannelFoodService =
      this.grpcClientCustomerOrderOnline.getService<CustomerOrderForChannelFoodServiceClient>(
        "CustomerOrderForChannelFoodService"
      );
    this.orderService =
      this.grpcClientOrderOnline.getService<OrderServiceClient>("OrderService");
    this.confirmOrderChannelService =
      this.grpcClientOrderOnline.getService<ConfirmOrderChannelServiceClient>(
        "ConfirmOrderChannelService"
      );

    this.grpcClientSyncConnectorChannelOrderShfService =
      this.grpcClientSyncConnectorChannelOrderShf.getService<SyncConnectorChannelOrderServiceClient>(
        "SyncConnectorChannelOrderService"
      );
    this.grpcClientSyncConnectorChannelOrderGrfService =
      this.grpcClientSyncConnectorChannelOrderGrf.getService<SyncConnectorChannelOrderServiceClient>(
        "SyncConnectorChannelOrderService"
      );
    this.grpcClientSyncConnectorChannelOrderBefService =
      this.grpcClientSyncConnectorChannelOrderBef.getService<SyncConnectorChannelOrderServiceClient>(
        "SyncConnectorChannelOrderService"
      );
    this.grpcClientBranchFoodMapFoodChannelService =
      this.grpcClientDashboard.getService<BranchFoodMapFoodChannelServiceClient>(
        "BranchFoodMapFoodChannelService"
      );
  }

  async findAll(): Promise<ChannelOrderFoodEntity[]> {
    return await this.channelOrderFoodRepository.find();
  }

  async findById(id: number): Promise<ChannelOrderFoodEntity> {
    const channelOrderFood = await this.channelOrderFoodRepository.findOneById(
      id
    );

    return channelOrderFood;
  }

  async create(
    channelOrderFoodData: ChannelOrderFoodEntity
  ): Promise<ChannelOrderFoodEntity> {
    const newchannelOrderFood =
      this.channelOrderFoodRepository.create(channelOrderFoodData);
    return await this.channelOrderFoodRepository.save(newchannelOrderFood);
  }

  async update(
    id: number,
    channelOrderFoodData: ChannelOrderFoodEntity
  ): Promise<ChannelOrderFoodEntity> {
    await this.channelOrderFoodRepository.update(id, channelOrderFoodData);
    return await this.findById(id);
  }

  async spGListchannelOrderFood(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    isConnect: number,
    keySearch: string
  ): Promise<ChannelOrderFoodDataModel[]> {
    const result = await this.channelOrderFoodRepository.query(
      `
      CALL sp_g_list_channel_order_food(?, ?, ?, ?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `,
      [
        restaurantId,
        restaurantBrandId,
        channelOrderFoodId,
        isConnect,
        keySearch,
      ]
    );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<
      ChannelOrderFoodDataModel[]
    >().getResultList(result);
  }

  async getListCustomerOrderOnline(
    branch_id: number,
    customer_order_type: number,
    customer_order_status: string
  ): Promise<BaseListResponse> {
    try {
      let data = await lastValueFrom(
        this.customerOrderForChannelFoodService.getList({
          branch_id: branch_id,
          customer_order_type: customer_order_type,
          customer_order_status: customer_order_status,
        })
      );
      
      return data;
    } catch (error) {
      return {
        status: 400,
        message: error,
        data: [],
        is_have_new_order: 0,
      };
    }
  }

  async getDetailCustomerOrderOnline(id: number): Promise<BaseDetailResponse> {
    try {
      let data = await lastValueFrom(
        this.customerOrderForChannelFoodService.getDetail({
          id: id,
        })
      );

      return data;
    } catch (error) {
      return {
        status: 400,
        message: error,
        data: null,
      };
    }
  }

  async closeOrder(orderId: number): Promise<BaseResponse> {
    try {
      let data = await lastValueFrom(
        this.orderService.closeAppFood({
          order_id: orderId,
        })
      );

      return data;
    } catch (error) {
      return {
        status: 400,
        message: error,
        data: "",
      };
    }
  }

  async completeOrderGrpc(restaurantOrderIds: string): Promise<BaseResponse> {
    try {
      let data = await lastValueFrom(
        this.orderService
          .completeAppFoodV2({
            order_ids: restaurantOrderIds,
          })
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: JSON.stringify(
                JSON.parse(restaurantOrderIds).map(
                  (item) => item.restaurant_order_id
                )
              ),
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
        data: JSON.stringify(
          JSON.parse(restaurantOrderIds).map((item) => item.restaurant_order_id)
        ),
      };
    }
  }

  async getBranchFoodMapInformationGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number
  ): Promise<BranchFoodMapInformationResponseBaseResponse> {
    try {
      let data = await lastValueFrom(
        this.grpcClientBranchFoodMapFoodChannelService
          .getBranchFoodMapInformation({
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
          })
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: {
                foods: "[]",
              },
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
        data: {
          foods: "[]",
        },
      };
    }
  }

  async closeOrderGrpc(restaurantOrderIds: string): Promise<BaseResponse> {
    try {
      let data = await lastValueFrom(
        this.orderService
          .closeAppFoodV2({
            order_ids: restaurantOrderIds,
          })
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: JSON.stringify(
                JSON.parse(restaurantOrderIds).map(
                  (item) => item.restaurant_order_id
                )
              ),
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
        data: JSON.stringify(
          JSON.parse(restaurantOrderIds).map((item) => item.restaurant_order_id)
        ),
      };
    }
  }

  async spGListChannelOrderHistory(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    fromDateString: string,
    toDateString: string
  ): Promise<
    StoreProcedureOutputResultInterface<
      ChannelOrderHistoryDataModel,
      ChannelOrderHistoryOutputDataModel
    >
  > {

    let channelOrderHistoryDataModel: ChannelOrderHistoryDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_list_channel_order_history(? , ? , ? , ? , ? , ? , 
      @totalOrderCompleted , @totalOrderCancelled , @totalRevenue , 
      @totalRevenueSHF , @totalRevenueGRF , @totalRevenueGOF , @totalRevenueBEF , 
      @status, @message); 
      SELECT @totalOrderCompleted AS total_order_completed, @totalOrderCancelled AS total_order_cancelled, @totalRevenue AS total_revenue, 
      @totalRevenueSHF AS total_revenue_SHF, @totalRevenueGRF AS total_revenue_GRF, 
      @totalRevenueGOF AS total_revenue_GOF, @totalRevenueBEF AS total_revenue_BEF
      , @status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          fromDateString,
          toDateString,
        ]
      );

    ExceptionStoreProcedure.validate(channelOrderHistoryDataModel);

    let data: StoreProcedureOutputResultInterface<
      ChannelOrderHistoryDataModel,
      ChannelOrderHistoryOutputDataModel
    > =
      new StoreProcedureResultOutput<ChannelOrderHistoryOutputDataModel>().getResultOutputList(
        channelOrderHistoryDataModel
      );

    return data;
  }

  async spGRpChannelFoodRevenueSumary(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    hourToTakeReport: number,
    groupByType: number,
    fromDateString: string,
    toDateString: string
  ): Promise<
    StoreProcedureOutputResultInterface<
      ChannelFoodRevenueSumaryDataModel,
      ChannelFoodRevenueSumaryOutputDataModel
    >
  > {
    let channelFoodRevenueSumaryDataModel: ChannelFoodRevenueSumaryDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_rp_channel_food_revenue_sumary(? , ? , ? , ? , ? , ? , ? , ?,
      @totalOrder , 
      @totalOrderSHF , 
      @totalOrderGRF , 
      @totalOrderGOF , 
      @totalOrderBEF , 
      @totalRevenue , 
      @totalRevenueSHF , 
      @totalRevenueGRF , 
      @totalRevenueGOF , 
      @totalRevenueBEF , 
      @percentSHF , 
      @percentGRF , 
      @percentGOF , 
      @percentBEF , 
      @status, @message); 
      SELECT 
      @totalOrder AS total_order,
      @totalOrderSHF AS total_order_SHF, 
      @totalOrderGRF AS total_order_GRF, 
      @totalOrderGOF AS total_order_GOF,
      @totalOrderBEF AS total_order_BEF, 
      @totalRevenue AS total_revenue, 
      @totalRevenueSHF AS total_revenue_SHF, 
      @totalRevenueGRF AS total_revenue_GRF,  
      @totalRevenueGOF AS total_revenue_GOF,  
      @totalRevenueBEF AS total_revenue_BEF, 
      @percentSHF AS percent_SHF, 
      @percentGRF AS percent_GRF, 
      @percentGOF AS percent_GOF,  
      @percentBEF AS percent_BEF, 
      @status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          hourToTakeReport,
          groupByType,
          fromDateString,
          toDateString,
        ]
      );

    ExceptionStoreProcedure.validate(channelFoodRevenueSumaryDataModel);

    let data: StoreProcedureOutputResultInterface<
      ChannelFoodRevenueSumaryDataModel,
      ChannelFoodRevenueSumaryOutputDataModel
    > =
      new StoreProcedureResultOutput<ChannelFoodRevenueSumaryOutputDataModel>().getResultOutputList(
        channelFoodRevenueSumaryDataModel
      );

    return data;
  }

  async spGRpChannelFoodSumaryData(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    hourToTakeReport: number,
    groupByType: number,
    fromDateString: string,
    toDateString: string
  ): Promise<ChannelFoodSumaryDataModel> {
    let result: ChannelFoodSumaryDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_rp_channel_food_sumary_data(? , ? , ? , ? , ? , ? , ? , ?, @status , @message );
        SELECT @status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          hourToTakeReport,
          groupByType,
          fromDateString,
          toDateString,
        ]
      );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<ChannelFoodSumaryDataModel>().getResultDetail(
      result
    );
  }

  

  async spGListChannelOrderComplete(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number
  ): Promise<ChannelOrderCompleteDataModel> {
    let result: ChannelOrderCompleteDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_list_channel_order_complete(? , ? , ? 
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
        [restaurantId, restaurantBrandId, branchId]
      );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<ChannelOrderCompleteDataModel>().getResultDetail(
      result
    );
  }

  async spGListChannelOrderCompleteV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number
  ): Promise<ChannelOrderCompleteDataModel> {
    let result: ChannelOrderCompleteDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_list_channel_order_complete_v2(? , ? , ? 
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
        [restaurantId, restaurantBrandId, branchId]
      );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<ChannelOrderCompleteDataModel>().getResultDetail(
      result
    );
  }

  async spGListChannelOrderCompleteV3(
    branchId: number
  ): Promise<ChannelOrderByIdsDataModel[]> {
    let result: ChannelOrderByIdsDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_list_channel_order_complete_v3(?, @status , @message );
        SELECT @status AS status_code , @message AS message_error`,
        [branchId]
      );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<ChannelOrderByIdsDataModel[]>().getResultList(
      result
    );
  }

  async spUUpdateChannelOrderCompleteGrpc(
    restaurantOrderIds: string,
    restaurantOrdeNotUpdateIds: string
  ): Promise<any[]> {


    // console.log('restaurantOrderIds', restaurantOrderIds , '   restaurantOrdeNotUpdateIds', restaurantOrdeNotUpdateIds);
    
    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_update_channel_order_complete_grpc(? , ? 
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [restaurantOrderIds, restaurantOrdeNotUpdateIds]
    );

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultList(result);
  }

  async spUUpdateChannelOrderCompleteGrpcV2(
    restaurantOrderIds: string,
  ): Promise<any> {
    
    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_update_channel_order_complete_grpc_v2(?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [restaurantOrderIds]
    );

    ExceptionStoreProcedure.validate(result);

    // return new StoreProcedureResult<any>().getResultList(result);
  }


  async spGRpChannelFoodMenu(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    hourToTakeReport: number,
    fromDateString: string,
    toDateString: string,
    keySearch: string,
    limit: number,
    offset: number
  ): Promise<
    StoreProcedureOutputResultInterface<
      ChannelFoodMenuReportDataModel,
      ChannelFoodMenuReportOutputDataModel
    >
  > {
    let result: ChannelFoodMenuReportDataModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_rp_channel_food_menu(? , ? , ? , ? , ? , ? , ? , ?, ? ,@totalRecord , @status, @message); 
      SELECT  @totalRecord AS total_record,@status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          hourToTakeReport,
          fromDateString,
          toDateString,
          keySearch,
          limit,
          offset,
        ]
      );

    ExceptionStoreProcedure.validate(result);

    let data: StoreProcedureOutputResultInterface<
      ChannelFoodMenuReportDataModel,
      ChannelFoodMenuReportOutputDataModel
    > =
      new StoreProcedureResultOutput<ChannelFoodMenuReportOutputDataModel>().getResultOutputList(
        result
      );

    return data;
  }

  async spGRpChannelOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    hourToTakeReport: number,
    fromDateString: string,
    toDateString: string,
    keySearch: string,
    offset: number,
    limit: number
  ): Promise<
    StoreProcedureOutputResultInterface<ChannelFoodOrderReportModel, any>
  > {
    const outputEntity = {
      total_record: 0,
    };

    let result: ChannelFoodOrderReportModel =
      await this.channelOrderFoodRepository.query(
        `CALL sp_g_rp_channel_food_orders(? , ? , ? , ? , ? , ? , ? , ?, ? , ? ,@totalRecord , @status, @message); 
      SELECT  @totalRecord AS total_record,@status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          hourToTakeReport,
          fromDateString,
          toDateString,
          keySearch,
          offset,
          limit,
        ]
      );

    ExceptionStoreProcedure.validate(result);

    let data: StoreProcedureOutputResultInterface<
      ChannelFoodOrderReportModel,
      typeof outputEntity
    > = new StoreProcedureResultOutput<
      typeof outputEntity
    >().getResultOutputList(result);

    return data;
  }

  async spUSyncChannelOrdersMongo(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    newOrders: string,
    historyOrders: string,
    branchFoodMaps: string
  ): Promise<any> {
    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_sync_channel_orders_mongo(? , ? , ? , ? , ? , ?, ?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [
        restaurantId,
        restaurantBrandId,
        branchId,
        channelOrderFoodId,
        newOrders,
        historyOrders,
        branchFoodMaps,
      ]
    );    

    ExceptionStoreProcedure.validate(result);
  }

  async spUSyncChannelOrdersMongoV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    newOrders: string,
    historyOrders: string,
    branchFoodMaps: string
  ): Promise<any> {
    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_sync_channel_orders_mongo_v2(? , ? , ? , ? , ? , ?, ?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [
        restaurantId,
        restaurantBrandId,
        branchId,
        channelOrderFoodId,
        newOrders,
        historyOrders,
        branchFoodMaps,
      ]
    );    
    
    ExceptionStoreProcedure.validate(result);
  }

  async spUCreateChannelOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    newOrders: string,
    branchFoodMaps: string
  ): Promise<any> {

    if(newOrders == "[]"){
      return null ; 
    }

    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_create_channel_orders(? , ? , ? , ? , ?, ?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [
        restaurantId,
        restaurantBrandId,
        branchId,
        channelOrderFoodId,
        newOrders,
        branchFoodMaps,
      ]
    );    
    
    ExceptionStoreProcedure.validate(result);
    
  }

  async spUCreateChannelOrdersV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    newOrders: string,
    branchFoodMaps: string
  ): Promise<ChannelOrderNewDataModel[]> {

    try {
      
      if(newOrders == "[]"){
        return null ; 
      }

      let result = await this.channelOrderFoodRepository.query(
        `CALL sp_u_create_channel_orders_v2(? , ? , ? , ?, ?
        , @status , @message );
        SELECT @status AS status_code , @message AS message_error`,
        [
          restaurantId,
          restaurantBrandId,
          branchId,
          newOrders,
          branchFoodMaps,
        ]
      );    

      // console.log(result);
      
      ExceptionStoreProcedure.validate(result);

      return new StoreProcedureResult<ChannelOrderNewDataModel[]>().getResultList(result);    

    } catch (error) {
      
      console.log('đơn mới :',error);
      

      return [];
    }
  }

  async spUUpdateChannelOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    newOrders: string,
    historyOrders: string,
    branchFoodMaps: string
  ): Promise<any> {

    if(newOrders == "[]" || historyOrders == "[]"){
      return null ; 
    }

    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_update_channel_orders(? , ? , ? , ? , ? , ?, ?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [
        restaurantId,
        restaurantBrandId,
        branchId,
        channelOrderFoodId,
        newOrders,
        historyOrders,
        branchFoodMaps,
      ]
    );    
    
    ExceptionStoreProcedure.validate(result);
    
  }

  async spUUpdateChannelOrdersV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    historyOrders: string,
  ): Promise<{
    is_done : number
  }> {

    try {
    
    if(historyOrders == "[]"){
      return null ; 
    }    

    let result = await this.channelOrderFoodRepository.query(
      `CALL sp_u_update_channel_orders_v2(? , ? , ? , ?
      , @status , @message );
      SELECT @status AS status_code , @message AS message_error`,
      [
        restaurantId,
        restaurantBrandId,
        branchId,
        historyOrders,
      ]
    );    
    
    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultDetail(result);    
  } catch (error) {
      console.log('đơn cũ :',error);

      return {is_done : 0};
  }
    
  }

  
  
  async syncChannelOrderToMysql(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    tokens: string
  ) {
    /**
     *
     * Bước 1 lấy danh sách đơn hàng mới insert (is_new = 1)
     *
     * Bước 2 lấy danh sách đơn hàng cập nhật (is_new = 0 && is_grpc_complete = 0)
     *
     * Bước 3 Đem dữ liêu Bước 1 và Bước 2 bỏ vào store procedure sp_u_sync_channel_orders_mongo để xử lý
     *
     * Bước 4 update lại trạng thái của đơn hàng đã được xử lý is_new = 0 && is_need_update = 0  trong mongo
     *
     * Bước 5 Lấy full danh sách đơn hàng trong mysql ở trạng thái cuối và is_grpc_complete = 0 để gửi sang order lv3 để xử lý
     *
     */
    try {
      

      const isSpamSyncOrderToMysql = await this.redisService.getKey(
        `food_channel_processor:check-sync-order-to-mysql-${branchId}-${channelOrderFoodId}`);
            
      if (isSpamSyncOrderToMysql) {
        return;
      }else{
        await this.redisService.setKeyV3(
          `food_channel_processor:check-sync-order-to-mysql-${branchId}-${channelOrderFoodId}`,"true",5);
      }      


      const branch = await this.elasticsearchService.findBranchById(
        `${process.env.CONFIG_ELASTICSEARCH_TECHRES_BRANCH_INDEX}`,
        branchId
      );
      

      if (!branch) {
        // console.log(`Chi nhánh ${branchId} không tồn tại`);
        return;
      }

      restaurantId = branch.restaurant_id;
      restaurantBrandId = branch.restaurant_brand_id;
      

      // Lấy danh sách đơn hàng mới (is_new = 1) từ mongo db
      const dataNewOrders = await this.channelOrderSchemaService.getNewOrdersV2(
        branchId,
        channelOrderFoodId
      );      

      const dataHistoryOrders =
        await this.channelOrderSchemaService.getHistoryOrdersV2(
          branchId,
          channelOrderFoodId
        );      

      let mergedDataFoodMap: any[] = [];

      if (dataNewOrders.length > 0) {
        const allFoodIds = new Set(
          dataNewOrders.flatMap((order) =>
            JSON.parse(order.details).map((item) => `${+item.food_id}`)
          )
        );        

        const keyFoodChannelFoodTechresMap = `food_channel_processor:food-channel-food-techres-map-${restaurantId}-${restaurantBrandId}-${branchId}-${channelOrderFoodId}`;

        let dataFoodChannelFoodTechresMap = await this.redisService.getKey(
          keyFoodChannelFoodTechresMap
        );

        if (!dataFoodChannelFoodTechresMap) {
          const dataGrpc = await this.getBranchFoodMapInformationGrpc(
            restaurantId,
            restaurantBrandId,
            branchId,
            channelOrderFoodId
          );

          await this.redisService.setKey(
            keyFoodChannelFoodTechresMap,
            dataGrpc.data.foods
          );

          dataFoodChannelFoodTechresMap = dataGrpc.data.foods;
        }

        
        const dataFoodChannelFoodTechresMapFilter: FoodChannelFoodTechresMap[] =
          JSON.parse(dataFoodChannelFoodTechresMap).filter((item) =>
            allFoodIds.has(`${+item.channel_food_id}`)
          );

        const dataTechresFoods: FoodTechres[] =
          await this.elasticsearchService.findFoodsByIds(
            `${process.env.CONFIG_ELASTICSEARCH_TECHRES_FOOD_INDEX}`,
            dataFoodChannelFoodTechresMapFilter.map((item) => +item.food_id)
          );        

        const dataBranchFoodMaps: branchFoodTechresMap[] =
          await this.elasticsearchService.findBranchFoodMapByFoodIds(
            `${process.env.CONFIG_ELASTICSEARCH_TECHRES_BRANCH_FOOD_MAP_INDEX}`,
            branchId,
            dataFoodChannelFoodTechresMapFilter.map((item) => +item.food_id)
          );        

        const foodMap = new Map(
          dataTechresFoods.map((item) => [+item.id, item])
        );

        const branchMap = new Map(
          dataBranchFoodMaps.map((item) => [+item.food_id, item])
        );
        // Tổng hợp
        mergedDataFoodMap = dataFoodChannelFoodTechresMapFilter.map((item) => {
          const food = foodMap.get(+item.food_id);
          const branch = branchMap.get(+item.food_id);

          return {
            channel_food_id: `${item.channel_food_id}`,
            is_allow_print_stamp: food?.is_allow_print_stamp ?? 0,
            restaurant_kitchen_place_id:
              branch?.restaurant_kitchen_place_id ?? 0,
          };
        });

      }

      if(dataNewOrders.length > 0){

        await this.spUCreateChannelOrders(
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          JSON.stringify(dataNewOrders),
          JSON.stringify(mergedDataFoodMap)
        );
        
      }

      if(dataNewOrders.length > 0 || dataHistoryOrders.length > 0){
      // Đồng bộ dữ liệu đơn hàng từ mongo sang mysql
        await this.spUUpdateChannelOrders(
          restaurantId,
          restaurantBrandId,
          branchId,
          channelOrderFoodId,
          JSON.stringify(dataNewOrders),
          JSON.stringify(dataHistoryOrders),
          JSON.stringify(mergedDataFoodMap)
        );
        // Cập nhật lại trạng thái đơn hàng mới vừa được xử lý cho mongo
      }
      
      if(dataNewOrders.length > 0 ){
        await this.channelOrderSchemaService.updateNewOrdersV2(
          // restaurantId,
          // restaurantBrandId,
          branchId,
          channelOrderFoodId,
          dataNewOrders
        );

        await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${restaurantId}-${restaurantBrandId}-${branchId}`);
        await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${restaurantId}-${restaurantBrandId}-${branchId}`);

      }      

      if(dataHistoryOrders.length > 0){

        // console.log(dataHistoryOrders.map(x => x.order_id));
        
        // Cập nhập lại danh sách đơn hàng cũ vừa được xử lý cho mongo db
          await this.channelOrderSchemaService.updateHistoryOrdersV2(
            // restaurantId,
            // restaurantBrandId,
            branchId,
            channelOrderFoodId,
            dataHistoryOrders
          );
        }

      // Tạo key redis để ngăn spam gọi grpc đến grpc order lv3 và vào mysql để check đơn hàng
      const isSpam = await this.redisService.getKey(
        `food_channel_processor:get-list-order-complete-${restaurantId}-${restaurantBrandId}-${branchId}`);

      if (!isSpam) {
        
        await this.redisService.setKeyV3(
          `food_channel_processor:get-list-order-complete-${restaurantId}-${restaurantBrandId}-${branchId}`,"true",5);
        // Lấy danh sách đơn hàng đủ điều kiện (hoàn tất hoặc huỷ) để gửi sang grpc order lv3 để xử lý
        const dataChannelOrderComplete = await this.spGListChannelOrderCompleteV2(
          restaurantId,
          restaurantBrandId,
          branchId
        );        

        let restaurantOrderGrpcIds: string = "";

        // Lấy danh sách đơn hàng hoàn tất để gửi sang grpc order lv3 để xử lý
        if (dataChannelOrderComplete.complete_ids != "[]") {
          const dataCompleteOrderGrpc = await this.completeOrderGrpc(
            dataChannelOrderComplete.complete_ids
          );

          if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
            restaurantOrderGrpcIds = dataCompleteOrderGrpc.data;
          }
        }

        // Lấy danh sách đơn hàng huỷ để gửi sang grpc order lv3 để xử lý
        if (dataChannelOrderComplete.cancelle_ids != "[]") {
          const dataCloseOrderGrpc = await this.closeOrderGrpc(
            dataChannelOrderComplete.cancelle_ids
          );

          if (dataCloseOrderGrpc.status != HttpStatus.OK) {
            restaurantOrderGrpcIds = restaurantOrderGrpcIds.concat(
              dataCloseOrderGrpc.data
            );
          }
        }    
        
        if(dataChannelOrderComplete.cancelle_ids != "[]" || dataChannelOrderComplete.complete_ids != "[]"){

          // Cập nhập trạng thái đơn hàng mysql để đánh dấu is_grpc_complete = 1
          const ordersCompleteGrpcIds =
            await this.spUUpdateChannelOrderCompleteGrpc(
              this.normalizeJsonArrayString(
                dataChannelOrderComplete.complete_ids.concat(
                  dataChannelOrderComplete.cancelle_ids
                )
              ),
              restaurantOrderGrpcIds == ""
                ? "[]"
                : this.normalizeJsonArrayString(restaurantOrderGrpcIds)
            );

          // Cập nhập trạng thái đơn hàng mongo để đánh dấu is_grpc_complete = 1
          if (
            !(
              ordersCompleteGrpcIds.length === 1 &&
              ordersCompleteGrpcIds[0].order_id === "000000"
            )
          ) {
            
            await this.channelOrderSchemaService.updateCompleteOrders(
              // restaurantId,
              // restaurantBrandId,
              branchId,
              ordersCompleteGrpcIds
            );
          }
        }
      }

      // Cập nhập token nếu có
      if (tokens != "[]") {
        await this.channelOrderFoodTokenService.spUUpdateReconnectionTokens(
          tokens
        );

        const isTokenExpired = tokens.includes('token_expired') ? true : false ;
        
        if(isTokenExpired){
          await this.redisService.deleteKeysWithPrefix(`food_channel_processor:list-error-${restaurantId}-${restaurantBrandId}-${branchId}`);
        }

        await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${restaurantId}-${restaurantBrandId}-${branchId}`);
      }

    } catch (error) {
      console.log(error);
    }
  }

  private normalizeJsonArrayString(jsonStr: string): string {
    if (!jsonStr || jsonStr === "[]") return "[]";
    return jsonStr
      .replace(/\]\[/g, ",") // Thay thế ][ bằng ,
      .replace(/,\]/g, "]") // Xóa dấu phẩy trước ]
      .replace(/\[,/g, "["); // Xóa dấu phẩy sau [
  }

  async healthCheckShfGrpc(): Promise<HealthCheckGRPCResponse> {
    try {
      let data = await lastValueFrom(
        this.grpcClientSyncConnectorChannelOrderShfService
          .healthCheckShf({})
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: "Bị mất kết nối",
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
        data: "",
      };
    }
  }

  async healthCheckGrfGrpc(): Promise<HealthCheckGRPCResponse> {
    try {
      let data = await lastValueFrom(
        this.grpcClientSyncConnectorChannelOrderGrfService
          .healthCheckGrf({})
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: "Bị mất kết nối",
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
        data: "",
      };
    }
  }

  async healthCheckBefGrpc(): Promise<HealthCheckGRPCResponse> {
    try {
      let data = await lastValueFrom(
        this.grpcClientSyncConnectorChannelOrderBefService
          .healthCheckBef({})
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: "Bị mất kết nối",
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
        data: "",
      };
    }
  }

  async confirmOrderChannelGrpc(
    branchId: number,
    request: any[]
  ): Promise<BaseConfirmOrderChannelResponse> {

    try {
      let data = await lastValueFrom(
        this.confirmOrderChannelService
          .confirmOrderChannel({
            branch_id: branchId,
            confirm_order_channel_requests: request,
          })
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: { channel_order_update_json: "[]" },
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
        data: { channel_order_update_json: "[]" },
      };
    }
  }

  async confirmOrderChannelGrpcV2(
    branchId: number,
    request: any[]
  ): Promise<BaseConfirmOrderChannelResponse> {

    try {
      
      let data = await lastValueFrom(
        this.confirmOrderChannelService
          .confirmOrderChanneV2({
            branch_id: branchId,
            confirm_order_channel_requests: request,
          })
          .pipe(
            retry({
              count: 3,
              delay: (error, retryCount) => {
                console.error(
                  `Error encountered during gRPC call (attempt ${retryCount}):`,
                  error
                );
                return timer(retryCount * 1000);
              },
            }),
            defaultIfEmpty({
              status: 400,
              message: "Error during gRPC call",
              data: { channel_order_update_json: "[]" },
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
        data: { channel_order_update_json: "[]" },
      };
    }
  }



  async syncChannelOrderToMysqlV2(
    branchId: number,
  ) {
    /**
     *
     * Bước 1 lấy danh sách đơn hàng mới insert (is_new = 1)
     *
     * Bước 2 lấy danh sách đơn hàng cập nhật (is_new = 0 && is_grpc_complete = 0)
     *
     * Bước 3 Đem dữ liêu Bước 1 và Bước 2 bỏ vào store procedure sp_u_sync_channel_orders_mongo để xử lý
     *
     * Bước 4 update lại trạng thái của đơn hàng đã được xử lý is_new = 0 && is_need_update = 0  trong mongo
     *
     * Bước 5 Lấy full danh sách đơn hàng trong mysql ở trạng thái cuối và is_grpc_complete = 0 để gửi sang order lv3 để xử lý
     *
     */
    try {
      let mergedDataFoodMap: any[] = [];
      let allFoodIds: Set<any>;
      let dataFoodChannelFoodTechResMap: any;
      let dataFoodChannelFoodTechResMapFilter: FoodChannelFoodTechresMap[] = [];
      let dataTechResFoods: FoodTechres[] = [];
      let dataBranchFoodMaps: branchFoodTechresMap[];
      let dataFoodChannelFoodTechResMapFilterIds: number[] = [];
      let foodMap: any;
      let branchMap: any;
      let branch: any;
      let dataNewOrders: any[] = [];
      let dataHistoryOrders: any[] = [];

      let restaurantId : number = 0;
      let restaurantBrandId : number = 0;

      let isCallApiV4 : string = '';
      let isCallApiV5 : string = '';

      const keyCheckSyncOrderToMysql = `food_channel_processor:check-sync-order-to-mysql-${branchId}`;
      const keyCheckApiV4 = `food-channel-processor:check-call-api-v4`;
      const keyCheckApiV5 = `food-channel-processor:check-call-api-v5`;

      if (await this.redisService.getKey(keyCheckSyncOrderToMysql)) return;
      await this.redisService.setKeyV3(keyCheckSyncOrderToMysql, "true", 5);

      [branch, dataNewOrders, dataHistoryOrders , isCallApiV4 , isCallApiV5] = await Promise.all([
        this.elasticsearchService.findBranchById(
          `${process.env.CONFIG_ELASTICSEARCH_TECHRES_BRANCH_INDEX}`,
          branchId
        ),
        this.channelOrderSchemaService.getNewOrdersV3(
          branchId
        ),
        this.channelOrderSchemaService.getHistoryOrdersV3(
          branchId
        ),
        this.redisService.getKey(keyCheckApiV4),
        this.redisService.getKey(keyCheckApiV5),
      ]);

      if (!branch) return;

      restaurantId = branch.restaurant_id;
      restaurantBrandId = branch.restaurant_brand_id;

      const keyFoodChannelFoodTechResMap = `food_channel_processor:food-channel-food-TechRes-map-${restaurantId}-${restaurantBrandId}-${branchId}`;
      const keyCheckIsSpamV4 = `food_channel_processor:get-list-order-complete-${restaurantId}-${restaurantBrandId}-${branchId}-v4`;        
      const keyCheckIsSpamV5 = `food_channel_processor:get-list-order-complete-${restaurantId}-${restaurantBrandId}-${branchId}-v5`;        

      // Xử lý song song đơn hàng mới và đơn hàng cập nhật
      await Promise.all([
        // Xử lý đơn hàng mới
        (async () => {
          if (dataNewOrders?.length > 0) {
            allFoodIds = new Set(
              dataNewOrders.flatMap((order) =>
                JSON.parse(order.details).map((item) => `${item.food_id}`)
              )
            );        

            dataFoodChannelFoodTechResMap = await this.redisService.getKey(keyFoodChannelFoodTechResMap);

            if (!dataFoodChannelFoodTechResMap) {
              dataFoodChannelFoodTechResMap =
                await this.getBranchFoodMapInformationGrpc(
                  restaurantId,
                  restaurantBrandId,
                  branchId,
                  -1
                );

              await this.redisService.setKey(
                keyFoodChannelFoodTechResMap,
                dataFoodChannelFoodTechResMap.data.foods
              );

              dataFoodChannelFoodTechResMap =
                dataFoodChannelFoodTechResMap.data.foods;
              
            }        
            
            dataFoodChannelFoodTechResMapFilter = JSON.parse(
              dataFoodChannelFoodTechResMap
            ).filter((item) => allFoodIds.has(`${item.channel_food_id}`));
            

            dataFoodChannelFoodTechResMapFilterIds =
              dataFoodChannelFoodTechResMapFilter.map((item) => +item.food_id);

            [dataTechResFoods, dataBranchFoodMaps] = await Promise.all([
              this.elasticsearchService.findFoodsByIds(
                `${process.env.CONFIG_ELASTICSEARCH_TECHRES_FOOD_INDEX}`,
                dataFoodChannelFoodTechResMapFilterIds
              ),
              this.elasticsearchService.findBranchFoodMapByFoodIds(
                `${process.env.CONFIG_ELASTICSEARCH_TECHRES_BRANCH_FOOD_MAP_INDEX}`,
                branchId,
                dataFoodChannelFoodTechResMapFilterIds
              ),
            ]);

            [foodMap, branchMap] = await Promise.all([
              new Map(dataTechResFoods.map((item) => [+item.id, item])),
              new Map(dataBranchFoodMaps.map((item) => [+item.food_id, item])),
            ]);

            // Tổng hợp
            mergedDataFoodMap = dataFoodChannelFoodTechResMapFilter.map((item) => {
              const food = foodMap.get(+item.food_id);
              const branch = branchMap.get(+item.food_id);

              return {
                channel_food_id: `${item.channel_food_id}`,
                is_allow_print_stamp: food?.is_allow_print_stamp ?? 0,
                restaurant_kitchen_place_id:
                  branch?.restaurant_kitchen_place_id ?? 0,
              };
            });
            
            const data : ChannelOrderNewDataModel[] =  await this.spUCreateChannelOrdersV2(
              restaurantId,
              restaurantBrandId,
              branchId,
              JSON.stringify(dataNewOrders),
              JSON.stringify(mergedDataFoodMap)
            )
      
            await Promise.all([
              this.channelOrderSchemaService.updateNewOrdersV3(
                branchId,
                data
              ),
              this.redisService.deleteKeysWithPrefix(
                `food_channel_processor:get-channel-order-${restaurantId}-${restaurantBrandId}-${branchId}`
              ),
              this.redisService.deleteKeysWithPrefix(
                `food_channel_controller:get-channel-order-${restaurantId}-${restaurantBrandId}-${branchId}`
              ),
            ]);
          }
        })(),
        // Xử lý đơn hàng cập nhật
        (async () => {
          if (dataHistoryOrders.length > 0) {
            const data = await this.spUUpdateChannelOrdersV2(
              restaurantId,
              restaurantBrandId,
              branchId,
              JSON.stringify(dataHistoryOrders)
            );
            
            if(data.is_done == 1){
              await this.channelOrderSchemaService.updateHistoryOrdersV3(
                branchId,
                dataHistoryOrders
              )
            }
          }
        })(),
      ]);

      if (isCallApiV4 && !(await this.redisService.getKey(keyCheckIsSpamV4))) {
        await this.redisService.setKeyV3(keyCheckIsSpamV4, "true", 5);
        // Lấy danh sách đơn hàng đủ điều kiện (hoàn tất hoặc huỷ) để gửi sang grpc order lv3 để xử lý
        const dataChannelOrderComplete =
          await this.spGListChannelOrderCompleteV2(
            restaurantId,
            restaurantBrandId,
            branchId
          );

        let restaurantOrderGrpcIds: string = "";

        const [dataCompleteOrderGrpc, dataCloseOrderGrpc] = await Promise.all([
          dataChannelOrderComplete.complete_ids != "[]" 
            ? this.completeOrderGrpc(dataChannelOrderComplete.complete_ids)
            : Promise.resolve(null),
        
          dataChannelOrderComplete.cancelle_ids != "[]" 
            ? this.closeOrderGrpc(dataChannelOrderComplete.cancelle_ids)
            : Promise.resolve(null),
        ]);
        
        
        if (dataCompleteOrderGrpc && dataCompleteOrderGrpc.status != HttpStatus.OK) {
          restaurantOrderGrpcIds = dataCompleteOrderGrpc.data;
        }
        
        if (dataCloseOrderGrpc && dataCloseOrderGrpc.status != HttpStatus.OK) {
          restaurantOrderGrpcIds = restaurantOrderGrpcIds.concat(
            dataCloseOrderGrpc.data
          );
        }
        
        if (
          dataChannelOrderComplete.cancelle_ids != "[]" ||
          dataChannelOrderComplete.complete_ids != "[]"
        ) {
          // Cập nhập trạng thái đơn hàng mysql để đánh dấu is_grpc_complete = 1
          const ordersCompleteGrpcIds =
            await this.spUUpdateChannelOrderCompleteGrpc(
              this.normalizeJsonArrayString(
                dataChannelOrderComplete.complete_ids.concat(
                  dataChannelOrderComplete.cancelle_ids
                )
              ),
              restaurantOrderGrpcIds == ""
                ? "[]"
                : this.normalizeJsonArrayString(restaurantOrderGrpcIds)
            );            

          // Cập nhập trạng thái đơn hàng mongo để đánh dấu is_grpc_complete = 1
          if (
            !(
              ordersCompleteGrpcIds.length === 1 &&
              ordersCompleteGrpcIds[0].order_id === "000000"
            )
          ) {
            await this.channelOrderSchemaService.updateCompleteOrders(
              branchId,
              ordersCompleteGrpcIds
            );
          }
        }
      }

      if (isCallApiV5 && !(await this.redisService.getKey(keyCheckIsSpamV5))) {
        await this.redisService.setKeyV3(keyCheckIsSpamV5, "true", 5);
        // Lấy danh sách đơn hàng đủ điều kiện (hoàn tất hoặc huỷ) để gửi sang grpc order lv3 để xử lý
        const dataChannelOrderCompletes : ChannelOrderByIdsDataModel[] =
          await this.spGListChannelOrderCompleteV3(
            branchId
          );

          if(dataChannelOrderCompletes.length > 0 ){
            
            const dataGrpc = await this.confirmOrderChannelGrpcV2(
              branchId,
              new ChannelOrderByIdsResponse().mapToList(dataChannelOrderCompletes)
            );            
              
            let idsUpdate: any[] = [];
            
            if (dataGrpc && dataGrpc.status == HttpStatus.OK) {
              const a = JSON.parse(dataGrpc.data.channel_order_update_json ?? '[]');
      
              if(!(a.length == 0)){
                idsUpdate = [...a.success_list, ...a.exit_list];
              }
            }    
            
            if(idsUpdate.length > 0){              

              const dataResultUpdate = dataChannelOrderCompletes.map(x => {
                const match = idsUpdate.find(item => +item.channel_order_id === +x.id);
                return {
                  channel_order_id: +x.id,
                  restaurant_order_id: match?.restaurant_order_id ?? 0,
                };
              });      
      
              await this.spUUpdateChannelOrderCompleteGrpcV2(JSON.stringify(dataResultUpdate));
              
              await this.channelOrderSchemaService.updateCompleteOrdersV2(
                branchId,
                dataResultUpdate.filter((x) => (x.restaurant_order_id ?? 0) > 0)
              );
            }
          }
      }


    } catch (error) {
      console.log(error);
    }
  }

  async handleReconnectionTokens(
    branchId:number,
    tokens: string
  ): Promise<void> {

    tokens = `[${tokens}]`;

    if (tokens === "[]" || tokens === "[{}]") return;        
    // 🔹 Cập nhật token trong DB
    await this.channelOrderFoodTokenService.spUUpdateReconnectionTokens(tokens);
  
    const branch : any = this.elasticsearchService.findBranchById(
      `${process.env.CONFIG_ELASTICSEARCH_TECHRES_BRANCH_INDEX}`,
      branchId);

    // 🔹 Kiểm tra token_expired
    const isTokenExpired = tokens.includes("token_expired");
  
    // 🔹 Nếu token hết hạn → xóa Redis key lỗi
    if (isTokenExpired) {
      await this.redisService.deleteKeysWithPrefix(
        `food_channel_processor:list-error-${branch.restaurant_id}-${branch.restaurant_brand_id}-${branchId}`,
      );
    }
  
    // 🔹 Xóa cache validator (luôn thực hiện)
    await this.redisService.deleteKeysWithPrefix(
      `food_channel:validator-${branch.restaurant_id}-${branch.restaurant_brand_id}-${branchId}`,
    );
  }

  async updateCompleteOrdersByChannelOrderId(
    channelOrderId: number
  ): Promise<void> {

    await this.channelOrderSchemaService.updateCompleteOrdersByChannelOrderId(channelOrderId);
  }
  

}
