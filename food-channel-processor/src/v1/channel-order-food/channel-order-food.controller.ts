import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Response } from 'express';
import {
  ApiBearerAuth
} from "@nestjs/swagger";
import { Pagination } from "src/utils.common/utils.pagination.pagination/utils.pagination";
import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { StoreProcedureOutputResultInterface } from "src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common";
import { BranchChannelFoodBranchMapsService } from "../branch-channel-food-branch-map/branch-channel-food-branch-maps.service";
import { ChannelOrderFoodApiService } from "../channel-order-food-api/channel-order-food-api.service";
import { ChannelOrderFoodTokenService } from "../channel-order-food-token/channel-order-food-token.service";
import { ChannelOrderFoodTokenEntity } from "../channel-order-food-token/entity/channel-order-food-token.entity";
import {
  GroupFoodToppingResponse,
} from "../grpc/interfaces/channel-order-food";
import {
  BranchChannelOrderFood,
  FoodChannelOrderFood,
} from "../grpc/interfaces/channel-order-food-api";
import { BaseListResponse } from "../grpc/interfaces/customer-order-for-channel-food";
import { SyncChannelOrdersService } from "../sync-channel-order/sync-channel-orders.service";
import { ChannelOrderFoodService } from "./channel-order-food.service";
import { ChannelFoodRevenueSumaryDataModel } from "./model/channel-food-revenue-sumary.data.model";
import { ChannelFoodRevenueSumaryOutputDataModel } from "./model/channel-food-revenue-sumary.output.data.model";
import { ChannelOrderHistoryDataModel } from "./model/channel-order-history.data.model";
import { ChannelOrderHistoryOutputDataModel } from "./model/channel-order-history.output.data.model";
import { ChannelFoodRevenueSumarOutputResponse } from "./response/channel-food-revenue-sumary.output.response";
import { ChannelOrderFoodResponse } from "./response/channel-order-food.response";
import { ChannelOrderHistoryOutputResponse } from "./response/channel-order-history.output.response";
import { CustomerOrderGrpcResponse } from "./response/customer-order-grpc-response";
import { CustomerOrderResponse } from "./response/customer-order-response";
import { RedisService } from "src/redis/redis.service";
import { UtilsDate } from "src/utils.common/utils.format-time.common/utils.format-time.common";
import { ChannelFoodMenuReportOutputResponse } from "./response/channel-food-menu-report.output.response";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum/utils.channel-order-food-number";
import { HealthCheckGRPCResponse } from "../grpc/interfaces/sync-connector-channel-order";
import { ChannelBranchSchemaService } from "../channel-branch-schema/channel-branch-schema.service";
import { ChannelBranchGrpcResponse } from "./response/channel-branch-grpc.response";
import { ChannelFoodSumaryDataResponse } from "./response/channel-food-sumary-data.response";
import { ChannelFoodSumaryDataModel } from "./model/channel-food-sumary-data.data.model";
import { ChannelFoodOrderReportOutputResponse } from "./response/channel-food-order-report.output.response";
import { ChannelOrderFoodStatusEnum } from "src/utils.common/utils.enum/utils.channel-order-food-status.enum";
import { ChannelOrderByIdsResponse } from "../sync-channel-order/response/channel-order-by-ids.response";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { BatchConfirmChannelOrderDto } from "./dto/batch-confirm-channel-order.dto";
import { ChannelOrderByIdResponse } from "../sync-channel-order/response/channel-order-by-id.response";
import { ChannelOrderByIdDataModel } from "../sync-channel-order/model/channel-order-by-id.data.model";
import { ChannelOrderPrintEntity } from "../sync-channel-order/entity/channel-order-print.entity";
import { ChannelOrderDriverEntity } from "../sync-channel-order/entity/channel-order-driver.entity";

@Controller({
  // version: VersionEnum.V1.toString(),
  path: "channel-order-foods",
})
@ApiBearerAuth()
export class ChannelOrderFoodController {
  static getBranchesChannelOrderFood: any;

  constructor(
    private readonly channelOrderFoodService: ChannelOrderFoodService,
    private readonly channelOrderFoodApiService: ChannelOrderFoodApiService,
    private readonly channelOrderFoodTokenService: ChannelOrderFoodTokenService,
    private readonly syncChannelOrdersService: SyncChannelOrdersService,
    private readonly branchChannelFoodBranchMapsService: BranchChannelFoodBranchMapsService,
    private readonly redisService: RedisService,
    private readonly channelBranchSchemaService: ChannelBranchSchemaService,
    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN
    )
    private readonly foodChannelTokenQueue: Queue,
    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_REFRESH_STATUS_CHANNEL_ORDER
    )
    private readonly refreshStatusChannelOrderQueue: Queue,
    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD
    )
    private readonly foodChannelTokenQueueSHF: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_GRAB_FOOD
    )
    private readonly foodChannelTokenQueueGRF: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD
    )
    private readonly foodChannelTokenQueueBEF: Queue,
  ) { }

  @GrpcMethod("ChannelOrderFoodService", "findById")
  async findById(data: { id: number }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.findById(data.id);
    response.setData(result);

    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getFoodsChannelOrderFood")
  async getFoodsChannelOrderFood(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
    channel_branch_id: string;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let dataObject =
      await this.syncChannelOrdersService.spGCheckFoodChannelObject(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        data.channel_branch_id
      );

    if (dataObject.message_error != "Success") {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(dataObject.message_error);
      return response;
    }

    let result: FoodChannelOrderFood[];

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      let dataSHF = await this.channelOrderFoodApiService.getFoodsSHFGrpc(
        dataObject.url_get_foods,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );
      if (dataSHF.status != HttpStatus.OK) {
        if (dataSHF.message == "Bad Request") {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(dataSHF.status);
          response.setMessageError(
            "Kết nối đã tự ngắt vì Token không hợp lệ, vui lòng kết nối lại"
          );
        } else {
          response.setStatus(dataSHF.status);
          response.setMessageError(dataSHF.message);
        }
        return response;
      }

      result = dataSHF.data;
    }

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      let dataGRF = await this.channelOrderFoodApiService.getFoodsGRFGrpc(
        dataObject.url_get_foods,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );
      if (dataGRF.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenGRFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.url_update_device,
          dataObject.username,
          dataObject.password,
          dataObject.device_id,
          dataObject.device_brand
        );
        if (!token) {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
        dataGRF = await this.channelOrderFoodApiService.getFoodsGRFGrpc(
          dataObject.url_get_foods,
          token.access_token,
          `${dataObject.channel_branch_id}`,
          `${dataObject.merchant_id}`,
          data.channel_order_food_id,
          dataObject.url_get_account_information_detail
        );
        if (dataGRF.status != HttpStatus.OK) {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(dataGRF.status);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
      }

      result = dataGRF.data;
    }

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      let dataBEF = await this.channelOrderFoodApiService.getFoodsBEFGrpc(
        dataObject.url_get_foods,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );

      if (dataBEF.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenBEFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.username,
          dataObject.password
        );
        if (!token) {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác BEF");
          return response;
        }
        dataBEF = await this.channelOrderFoodApiService.getFoodsBEFGrpc(
          dataObject.url_get_foods,
          token.access_token,
          `${dataObject.channel_branch_id}`,
          `${dataObject.merchant_id}`,
          data.channel_order_food_id,
          dataObject.url_get_account_information_detail
        );
        if (dataBEF.status != HttpStatus.OK) {
          response.setStatus(dataBEF.status);
          response.setMessageError(dataBEF.message);
          return response;
        }
      }

      result = dataBEF.data;
    }

    response.setStatus(HttpStatus.OK);
    response.setData(result);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getFoodToppings")
  async getFoodToppings(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
    channel_branch_id: string;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let dataObject =
      await this.syncChannelOrdersService.spGCheckFoodChannelObject(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        data.channel_branch_id
      );

    if (dataObject.message_error != "Success") {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(dataObject.message_error);
      return response;
    }

    let result: GroupFoodToppingResponse[];

    if (data.channel_order_food_id == 1) {
      let dataSHF = await this.channelOrderFoodApiService.getFoodToppingsSHFGrpc(
        dataObject.url_get_food_toppings,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );
      if (dataSHF.status != HttpStatus.OK) {
        if (dataSHF.message == "Bad Request") {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);
          
          response.setStatus(dataSHF.status);
          response.setMessageError(
            "Kết nối đã tự ngắt vì Token không hợp lệ, vui lòng kết nối lại"
          );
        } else {
          response.setStatus(dataSHF.status);
          response.setMessageError(dataSHF.message);
        }
        return response;
      }

      result = dataSHF.data;
    }

    if (data.channel_order_food_id == 2) {
      let dataGRF = await this.channelOrderFoodApiService.getFoodToppingsGRFGrpc(
        dataObject.url_get_food_toppings,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );
      if (dataGRF.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenGRFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.url_update_device,
          dataObject.username,
          dataObject.password,
          dataObject.device_id,
          dataObject.device_brand
        );
        if (!token) {
          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
        dataGRF = await this.channelOrderFoodApiService.getFoodToppingsGRFGrpc(
          dataObject.url_get_food_toppings,
          token.access_token,
          `${dataObject.channel_branch_id}`,
          `${dataObject.merchant_id}`,
          data.channel_order_food_id,
          dataObject.url_get_account_information_detail
        );
        if (dataGRF.status != HttpStatus.OK) {

          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(dataGRF.status);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
      }

      result = dataGRF.data;
    }

    if (data.channel_order_food_id == 4) {
      let dataBEF = await this.channelOrderFoodApiService.getFoodToppingsBEFGrpc(
        dataObject.url_get_food_toppings,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        dataObject.url_get_account_information_detail
      );

      if (dataBEF.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenBEFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.username,
          dataObject.password
        );
        if (!token) {
          await this.channelOrderFoodTokenService.updateUnconnectionToken(dataObject.channel_order_food_token_id);

          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác BEF");
          return response;
        }
        dataBEF = await this.channelOrderFoodApiService.getFoodToppingsBEFGrpc(
          dataObject.url_get_food_toppings,
          token.access_token,
          `${dataObject.channel_branch_id}`,
          `${dataObject.merchant_id}`,
          data.channel_order_food_id,
          dataObject.url_get_account_information_detail
        );
        if (dataBEF.status != HttpStatus.OK) {
          response.setStatus(dataBEF.status);
          response.setMessageError(dataBEF.message);
          return response;
        }
      }

      result = dataBEF.data;
    }

    response.setStatus(HttpStatus.OK);
    response.setData(result);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "updateFoodPrices")
  async updateFoodPrices(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
    channel_branch_id: string;
    foods: [
      {
        id: string;
        price: string;
      }
    ];
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let dataObject =
      await this.syncChannelOrdersService.spGCheckFoodChannelObject(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        data.channel_branch_id
      );

    if (dataObject.message_error != "Success") {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(dataObject.message_error);
      return response;
    }

    if (data.channel_order_food_id == 1) {
      const foodsBackup = await this.channelOrderFoodApiService.getFoodsGrpc(
        dataObject.url_get_foods,
        dataObject.access_token,
        `${dataObject.channel_branch_id}`,
        `${dataObject.merchant_id}`,
        data.channel_order_food_id,
        ""
      );
      if (foodsBackup.status != HttpStatus.OK) {
        if (foodsBackup.message == "Bad Request") {
          response.setStatus(foodsBackup.status);
          response.setMessageError(
            "Kết nối đã tự ngắt vì Token không hợp lệ, vui lòng kết nối lại"
          );
        } else {
          response.setStatus(foodsBackup.status);
          response.setMessageError(foodsBackup.message);
        }
        return response;
      }

      const foodsToUpdate = data.foods.map((food) => {
        const originalFood = foodsBackup.data.find((f) => f.id == food.id);
        return {
          ...food,
          orinal_price: originalFood ? originalFood.price : 0,
        };
      });

      let dataGrpc =
        await this.channelOrderFoodApiService.updatePriceFoodsShfGrpc(
          JSON.stringify(foodsToUpdate),
          dataObject.url_update_food,
          dataObject.access_token,
          +dataObject.channel_branch_id
        );

      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }
    }

    if (data.channel_order_food_id == 4) {
      let dataGrpc =
        await this.channelOrderFoodApiService.updatePriceFoodsBefGrpc(
          JSON.stringify(data.foods),
          dataObject.url_get_food_detail,
          dataObject.url_update_food,
          dataObject.access_token,
          `${dataObject.channel_branch_id}`,
          `${dataObject.merchant_id}`
        );

      if (dataGrpc.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenBEFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.username,
          dataObject.password
        );

        if (!token) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác BEF");
          return response;
        }
        dataGrpc =
          await this.channelOrderFoodApiService.updatePriceFoodsBefGrpc(
            JSON.stringify(data.foods),
            dataObject.url_get_food_detail,
            dataObject.url_update_food,
            token.access_token,
            `${dataObject.channel_branch_id}`,
            `${dataObject.merchant_id}`
          );
      }
    }

    response.setData({});
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getBranchesChannelOrderFood")
  async getBranchesChannelOrderFood(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let dataObject =
      await this.syncChannelOrdersService.spGCheckFoodChannelObject(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        "-1"
      );

    if (dataObject.message_error != "Success") {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(dataObject.message_error);
      return response;
    }

    let result: BranchChannelOrderFood[];

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      let dataBranches = await this.channelOrderFoodApiService.getBranchesGrpc(
        dataObject.url_get_branches,
        dataObject.x_merchant_token,
        dataObject.username,
        data.channel_order_food_id
      );
      if (dataBranches.status != HttpStatus.OK) {
        if (dataBranches.status == HttpStatus.UNAUTHORIZED) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(
            "Kết nối đã tự ngắt vì Token không hợp lệ, vui lòng kết nối lại"
          );
        } else {
          response.setStatus(dataBranches.status);
          response.setMessageError(dataBranches.message);
        }
        return response;
      }
      result = dataBranches.data;
    }

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      let dataBranches = await this.channelOrderFoodApiService.getBranchesGrpc(
        dataObject.url_get_account_information_detail,
        dataObject.access_token,
        dataObject.username,
        data.channel_order_food_id
      );

      if (dataBranches.status == HttpStatus.UNAUTHORIZED) {
        let tokenTemp = await this.syncTokenGRFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.url_update_device,
          dataObject.username,
          dataObject.password,
          dataObject.device_id,
          dataObject.device_brand
        );
        if (!tokenTemp) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
        dataBranches = await this.channelOrderFoodApiService.getBranchesGrpc(
          dataObject.url_get_branches,
          tokenTemp.access_token,
          dataObject.username,
          data.channel_order_food_id
        );
        if (dataBranches.status != HttpStatus.OK) {
          response.setStatus(dataBranches.status);
          response.setMessageError("Vui lòng kết nối lại đối tác GRF");
          return response;
        }
      }
      result = dataBranches.data;
    }

    if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      let dataBranches = await this.channelOrderFoodApiService.getBranchesGrpc(
        dataObject.url_get_branches,
        dataObject.access_token,
        dataObject.username,
        data.channel_order_food_id
      );
      if (dataBranches.status == HttpStatus.UNAUTHORIZED) {
        let token = await this.syncTokenBEFGrpc(
          data.restaurant_id,
          data.restaurant_brand_id,
          dataObject.channel_order_food_token_id,
          dataObject.url_login,
          dataObject.username,
          dataObject.password
        );

        if (!token) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Vui lòng kết nối lại đối tác BEF");
          return response;
        }
        dataBranches = await this.channelOrderFoodApiService.getBranchesGrpc(
          dataObject.url_get_branches,
          token.access_token,
          dataObject.username,
          data.channel_order_food_id
        );
        if (dataBranches.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataBranches.message);
          return response;
        }
      }
      await this.branchChannelFoodBranchMapsService.spUBranchInformationsForBEF(
        JSON.stringify(dataBranches.data)
      );
      result = dataBranches.data;
    }

    response.setStatus(HttpStatus.OK);
    response.setData(result);
    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodService",
    "getChannelBranchesOfTokenToConnection"
  )
  async getChannelBranchesOfTokenToConnection(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let dataBranches = await this.channelBranchSchemaService.getBranches(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.channel_order_food_id
    );

    response.setData(new ChannelBranchGrpcResponse().mapToListData(dataBranches));
    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodService",
    "syncBranches"
  )
  async syncBranches(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    const tokens =
      await this.channelOrderFoodTokenService.spGListChannelOrderFoodToken(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        -1,
        1
      );
    
    await this.channelBranchSchemaService.deleteBranches(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.channel_order_food_id
    );

    if (tokens.length > 0) {

      let dataGrpc: any;

      if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER)  {
        dataGrpc = await this.channelOrderFoodApiService.getChannelBranchesSHFGrpc(
          data.restaurant_brand_id,
          JSON.stringify(tokens)
        );
      }

      if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER)  {

        dataGrpc = await this.channelOrderFoodApiService.getChannelBranchesGRFGrpc(
          data.restaurant_brand_id,
          JSON.stringify(tokens)
        );
      }

      if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER)  {
        dataGrpc = await this.channelOrderFoodApiService.getChannelBranchesBEFGrpc(
          data.restaurant_brand_id,
          JSON.stringify(tokens)
        );
      }

      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        response.setData([]);
      }

      if (data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
        await this.branchChannelFoodBranchMapsService.spUBranchInformationsForBEF(
          JSON.stringify(dataGrpc.data)
        );
      }

      await this.channelBranchSchemaService.createMany(
        await this.channelBranchSchemaService.convertToChannelBranchSchemas(
          data.restaurant_id,
          data.restaurant_brand_id,
          data.channel_order_food_id,
          dataGrpc.data ?? [])
      );

      response.setData(dataGrpc.data);

    }
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "syncAssignBranch")
  async syncAssignBranch(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
    branch_maps: string;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    try {
      await this.syncChannelOrdersService.spUAssignChannelBranch(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.channel_order_food_id,
        data.branch_maps
      );

      await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${data.restaurant_id}-${data.restaurant_brand_id}`);

      response.setStatus(HttpStatus.OK);
      return response;
    } catch (error) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(error.message);
      return response;
    }
  }

  @GrpcMethod("ChannelOrderFoodService", "syncAssignMultipleChannelBranch")
  async syncAssignMultipleChannelBranch(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
    branch_maps: string;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    try {
      let entityToCheck = await this.channelOrderFoodService.findById(
        data.channel_order_food_id
      );
      if (!entityToCheck) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Kênh đối tác không hợp lệ");
        return response;
      }

      await this.branchChannelFoodBranchMapsService.spUAssignMultipleChannelBranch(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.branch_id,
        data.channel_order_food_id,
        data.branch_maps
      );


      await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${data.restaurant_id}-${data.restaurant_brand_id}`);


      response.setStatus(HttpStatus.OK);
      return response;
    } catch (error) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(error.message);
      return response;
    }
  }


  @GrpcMethod("ChannelOrderFoodService", "getList")
  async getList(query: {
    restaurant_id: number;
    restaurant_brand_id: number;
    channel_order_food_id: number;
    is_connect: number;
    key_search: string;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();

    const data = await this.channelOrderFoodService.spGListchannelOrderFood(
      query.restaurant_id,
      query.restaurant_brand_id,
      query.channel_order_food_id,
      query.is_connect,
      query.key_search
    );

    response.setData(new ChannelOrderFoodResponse().mapToList(data));

    return response;
  }

  @GrpcMethod("ChannelOrderService", "getOrders")
  async getOrders(query: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
    customer_order_status: string;
    is_have_restaurant_order: number;
    is_app_food: number;
    is_active: number;
    tokens: string;
    is_use_kafka: number;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();
    let isValid = query.is_active;
    let list: any;
    let dataErorr: any[] = [];   

    let keyGetChannelOrder = `food_channel_processor:get-channel-order-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}-${query.channel_order_food_id}-${query.customer_order_status}-${query.is_have_restaurant_order}-${query.is_app_food}`;

    let listChannelOrders = await this.redisService.getKey(
      keyGetChannelOrder
    );

    if (!listChannelOrders) {

      if (query.is_app_food == -1) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );          

        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        if (isValid == 1) {


          const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpc(
            query.restaurant_id,
            query.restaurant_brand_id,
            query.branch_id,
            query.channel_order_food_id,
            "[]",
            "",
            query.is_have_restaurant_order,
            await new Pagination(0, 10000)
          );

          const dbOrders = await new CustomerOrderResponse().mapToList(
            dataDB.list
          );

          const grpcOrders = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );

          list = grpcOrders.concat(dbOrders);
        } else {
          list = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );
        }
      }


      if (query.is_app_food == 0) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );
        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        list = await new CustomerOrderGrpcResponse().mapToList(
          dataGrpc.data || []
        );
      }
      if (query.is_app_food == 1 && isValid == 1) {
        const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpc(
          query.restaurant_id,
          query.restaurant_brand_id,
          query.branch_id,
          query.channel_order_food_id,
          "[]",
          "",
          query.is_have_restaurant_order,
          await new Pagination(0, 10000)
        );

        list = await new CustomerOrderResponse().mapToList(dataDB.list);
      }

      await this.redisService.setKeyGetChannelOrder(
        keyGetChannelOrder,
        JSON.stringify(list)
      );
    }
    else {
      list = JSON.parse(listChannelOrders);
    }

    if (isValid == 1) {

      let isSync: boolean = false;

      const isSendShf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-shopeefood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_SHOPEE_FOOD_CONNECTOR ?? 10));
      
      const isSendGrf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-grabfood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_GRAB_FOOD_CONNECTOR ?? 10));
      
      const isSendBef = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-befood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_BE_FOOD_CONNECTOR ?? 10));

      if(!isSendShf || !isSendGrf || !isSendBef){
        isSync = true ; 
      }

      if (query.tokens != '[]' && isSync) {        

        for(let token of JSON.parse(query.tokens)){

          if(token.channel_order_food_id == 1 && !isSendShf){
            await this.addJobTokenShopeeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 2 && !isSendGrf){
            await this.addJobTokenGrabFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 4 && !isSendGrf){
            await this.addJobTokenBeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          }
        }
      }
    }

    response.setData({
      errors: dataErorr,
      list: !list ? [] : list,
    });
    
    return response;

  }


  @GrpcMethod("ChannelOrderService", "getOrdersV2")
  async getOrdersv2(query: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
    customer_order_status: string;
    is_have_restaurant_order: number;
    is_app_food: number;
    is_active: number;
    tokens: string;
    is_use_kafka: number;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();
    let isValid = query.is_active;
    let list: any;
    let dataErorr: any[] = [];   
        
    let keyGetChannelOrder = `food_channel_processor:get-channel-order-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}-${query.channel_order_food_id}-${query.customer_order_status}-${query.is_have_restaurant_order}-${query.is_app_food}`;

    let listChannelOrders = await this.redisService.getKey(
      keyGetChannelOrder
    );

    if (!listChannelOrders) {

      if (query.is_app_food == -1) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );          

        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        if (isValid == 1) {


          const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV2(
            query.restaurant_id,
            query.restaurant_brand_id,
            query.branch_id,
            query.channel_order_food_id,
            "[]",
            "",
            query.is_have_restaurant_order,
            await new Pagination(0, 10000)
          );

          const dbOrders = await new CustomerOrderResponse().mapToList(
            dataDB.list
          );

          const grpcOrders = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );

          list = grpcOrders.concat(dbOrders);
        } else {
          list = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );
        }
      }


      if (query.is_app_food == 0) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );
        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        list = await new CustomerOrderGrpcResponse().mapToList(
          dataGrpc.data || []
        );
      }
      if (query.is_app_food == 1 && isValid == 1) {
        const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV2(
          query.restaurant_id,
          query.restaurant_brand_id,
          query.branch_id,
          query.channel_order_food_id,
          "[]",
          "",
          query.is_have_restaurant_order,
          await new Pagination(0, 10000)
        );

        list = await new CustomerOrderResponse().mapToList(dataDB.list);
      }

      await this.redisService.setKeyGetChannelOrder(
        keyGetChannelOrder,
        JSON.stringify(list)
      );
    }
    else {
      list = JSON.parse(listChannelOrders);
    }

    if (isValid == 1) {

      let isSync: boolean = false;

      const isSendShf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-shopeefood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_SHOPEE_FOOD_CONNECTOR ?? 10));
      
      const isSendGrf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-grabfood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_GRAB_FOOD_CONNECTOR ?? 10));
      
      const isSendBef = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-befood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_BE_FOOD_CONNECTOR ?? 10));

      if(!isSendShf || !isSendGrf || !isSendBef){
        isSync = true ; 
      }

      if (query.tokens != '[]' && isSync) {        

        for(let token of JSON.parse(query.tokens)){

          if(token.channel_order_food_id == 1 && !isSendShf){
            await this.addJobTokenShopeeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 2 && !isSendGrf){
            await this.addJobTokenGrabFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 4 && !isSendGrf){
            await this.addJobTokenBeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          }
        }
      }

      const keyError = `food_channel_processor:list-error-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}`

      let resultKeyError = await this.redisService.getKey(keyError);

      if(!resultKeyError){
        const dataErrorDb = await this.channelOrderFoodTokenService.getlistTokenError(query.restaurant_id,query.restaurant_brand_id);

        await this.redisService.setKeyV2(
          keyError,
          JSON.stringify(dataErrorDb)
        );

        dataErorr = dataErrorDb;
      }else{
        dataErorr = JSON.parse(resultKeyError);
      }
    }

    response.setData({
      errors: dataErorr,
      list: !list ? [] : list,
    });
    
    return response;

  }

  @GrpcMethod("ChannelOrderService", "getOrdersV3")
  async getOrdersv3(query: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
    customer_order_status: string;
    is_have_restaurant_order: number;
    is_app_food: number;
    is_active: number;
    tokens: string;
    is_use_kafka: number;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();
    let isValid = query.is_active;
    let list: any;
    let dataErorr: any[] = [];  
    let is_new_order_app_food = 0;
    let is_new_order_online = 0;

    let keyGetChannelOrder = `food_channel_processor:get-channel-order-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}-${query.channel_order_food_id}-${query.customer_order_status}-${query.is_have_restaurant_order}-${query.is_app_food}`;

    let listChannelOrders = await this.redisService.getKey(
      keyGetChannelOrder
    );

    if (!listChannelOrders) {

      if (query.is_app_food == -1) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );          

        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          
          return response;
        }

        is_new_order_online = dataGrpc.is_have_new_order ?? 0;

        if (isValid == 1) {


          const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV3(
            query.restaurant_id,
            query.restaurant_brand_id,
            query.branch_id,
            query.channel_order_food_id,
            "[]",
            "",
            query.is_have_restaurant_order,
            await new Pagination(0, 10000)
          );

          const dbOrders = await new CustomerOrderResponse().mapToList(
            dataDB.list
          );        
          
          is_new_order_app_food = dataDB.output?.is_have_new_order ?? 0;          

          if(is_new_order_app_food > 0){
            this.syncChannelOrdersService.updateNotifiedByChannelOrderIds(dataDB.list.filter(item => item.is_notified == 0).map(item => item.id));
          }

          const grpcOrders = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );

          list = grpcOrders.concat(dbOrders);
        } else {
          list = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );
        }
      }


      if (query.is_app_food == 0) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );
        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        is_new_order_online = dataGrpc.is_have_new_order ?? 0;

        list = await new CustomerOrderGrpcResponse().mapToList(
          dataGrpc.data || []
        );
      }

      if (query.is_app_food == 1 && isValid == 1) {
        const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV3(
          query.restaurant_id,
          query.restaurant_brand_id,
          query.branch_id,
          query.channel_order_food_id,
          "[]",
          "",
          query.is_have_restaurant_order,
          await new Pagination(0, 10000)
        );

        list = await new CustomerOrderResponse().mapToList(dataDB.list);

        is_new_order_app_food = dataDB.output?.is_have_new_order ?? 0;

        if(is_new_order_app_food > 0){
          this.syncChannelOrdersService.updateNotifiedByChannelOrderIds(dataDB.list.filter(item => item.is_notified == 0).map(item => item.id));
        }

      }

      await this.redisService.setKeyGetChannelOrder(
        keyGetChannelOrder,
        JSON.stringify(list)
      );
    }
    else {
      list = JSON.parse(listChannelOrders);
    }


    if (isValid == 1) {

      let isSync: boolean = false;

      const isSendShf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-shopeefood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_SHOPEE_FOOD_CONNECTOR ?? 10));
      
      const isSendGrf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-grabfood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_GRAB_FOOD_CONNECTOR ?? 10));
      
      const isSendBef = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-befood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_BE_FOOD_CONNECTOR ?? 10));

      if(!isSendShf || !isSendGrf || !isSendBef){
        isSync = true ; 
      }

      if (query.tokens != '[]' && isSync) {        

        for(let token of JSON.parse(query.tokens)){

          if(token.channel_order_food_id == 1 && !isSendShf){
            await this.addJobTokenShopeeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 2 && !isSendGrf){
            await this.addJobTokenGrabFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 4 && !isSendGrf){
            await this.addJobTokenBeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          }
        }
      }

      const keyError = `food_channel_processor:list-error-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}`

      let resultKeyError = await this.redisService.getKey(keyError);

      if(!resultKeyError){
        const dataErrorDb = await this.channelOrderFoodTokenService.getlistTokenError(query.restaurant_id,query.restaurant_brand_id);

        await this.redisService.setKeyV2(
          keyError,
          JSON.stringify(dataErrorDb)
        );

        dataErorr = dataErrorDb;
      }else{
        dataErorr = JSON.parse(resultKeyError);
      }
    }  

    await this.redisService.setKeyV3(
      `food-channel-processor:check-call-api-v4`,
      'true',
      7200
    );

    response.setData({
      errors: dataErorr,
      list: !list ? [] : list,
      is_new_order_app_food : is_new_order_app_food,
      is_new_order_online : is_new_order_online
    });
    
    return response;

  }

  @GrpcMethod("ChannelOrderService", "getOrdersV4")
  async getOrdersv4(query: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_order_food_id: number;
    customer_order_status: string;
    is_have_restaurant_order: number;
    is_app_food: number;
    is_active: number;
    tokens: string;
    is_use_kafka: number;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();
    let isValid = query.is_active;
    let list: any;
    let dataErorr: any[] = [];  
    let is_new_order_app_food = 0;
    let is_new_order_online = 0;

    let keyGetChannelOrder = `food_channel_processor:get-channel-order-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}-${query.channel_order_food_id}-${query.customer_order_status}-${query.is_have_restaurant_order}-${query.is_app_food}-v4`;

    let listChannelOrders = await this.redisService.getKey(
      keyGetChannelOrder
    );

    if (!listChannelOrders) {

      if (query.is_app_food == -1) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );          

        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          
          return response;
        }

        is_new_order_online = dataGrpc.is_have_new_order ?? 0;

        if (isValid == 1) {


          const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV4(
            query.restaurant_id,
            query.restaurant_brand_id,
            query.branch_id,
            query.channel_order_food_id,
            "[]",
            "",
            query.is_have_restaurant_order,
            await new Pagination(0, 10000)
          );

          const dbOrders = await new CustomerOrderResponse().mapToList(
            dataDB.list
          );        
          
          is_new_order_app_food = dataDB.output?.is_have_new_order ?? 0;          

          if(is_new_order_app_food > 0){
            this.syncChannelOrdersService.updateNotifiedByChannelOrderIds(dataDB.list.filter(item => item.is_notified == 0).map(item => item.id));
          }

          const grpcOrders = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );

          list = grpcOrders.concat(dbOrders);
        } else {
          list = await new CustomerOrderGrpcResponse().mapToList(
            dataGrpc.data || []
          );
        }
      }


      if (query.is_app_food == 0) {
        const dataGrpc: BaseListResponse =
          await this.channelOrderFoodService.getListCustomerOrderOnline(
            query.branch_id,
            -1,
            query.customer_order_status
          );
        if (dataGrpc.status != 200) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        is_new_order_online = dataGrpc.is_have_new_order ?? 0;

        list = await new CustomerOrderGrpcResponse().mapToList(
          dataGrpc.data || []
        );
      }

      if (query.is_app_food == 1 && isValid == 1) {
        const dataDB = await this.syncChannelOrdersService.spGListOrderForGrpcV4(
          query.restaurant_id,
          query.restaurant_brand_id,
          query.branch_id,
          query.channel_order_food_id,
          "[]",
          "",
          query.is_have_restaurant_order,
          await new Pagination(0, 10000)
        );

        list = await new CustomerOrderResponse().mapToList(dataDB.list);

        is_new_order_app_food = dataDB.output?.is_have_new_order ?? 0;

        if(is_new_order_app_food > 0){
          this.syncChannelOrdersService.updateNotifiedByChannelOrderIds(dataDB.list.filter(item => item.is_notified == 0).map(item => item.id));
        }

      }

      await this.redisService.setKeyGetChannelOrder(
        keyGetChannelOrder,
        JSON.stringify(list)
      );
    }
    else {
      list = JSON.parse(listChannelOrders);
    }


    if (isValid == 1) {

      let isSync: boolean = false;

      const isSendShf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-shopeefood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_SHOPEE_FOOD_CONNECTOR ?? 10));
      
      const isSendGrf = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-grabfood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_GRAB_FOOD_CONNECTOR ?? 10));
      
      const isSendBef = await this.redisService.checkSpamByRedis(`food_channel_processor:send-token-befood-to-queue-${query.branch_id}`,+(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_BE_FOOD_CONNECTOR ?? 10));

      if(!isSendShf || !isSendGrf || !isSendBef){
        isSync = true ; 
      }

      if (query.tokens != '[]' && isSync) {        

        for(let token of JSON.parse(query.tokens)){

          if(token.channel_order_food_id == 1 && !isSendShf){
            await this.addJobTokenShopeeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 2 && !isSendGrf){
            await this.addJobTokenGrabFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          };

          if(token.channel_order_food_id == 4 && !isSendGrf){
            await this.addJobTokenBeFoood(query.branch_id,token.channel_branch_id ,JSON.stringify(token));
          }
        }
      }

      const keyError = `food_channel_processor:list-error-${query.restaurant_id}-${query.restaurant_brand_id}-${query.branch_id}`

      let resultKeyError = await this.redisService.getKey(keyError);

      if(!resultKeyError){
        const dataErrorDb = await this.channelOrderFoodTokenService.getlistTokenError(query.restaurant_id,query.restaurant_brand_id);

        await this.redisService.setKeyV2(
          keyError,
          JSON.stringify(dataErrorDb)
        );

        dataErorr = dataErrorDb;
      }else{
        dataErorr = JSON.parse(resultKeyError);
      }
    }  

    await this.redisService.setKeyV3(
      `food-channel-processor:check-call-api-v5`,
      'true',
      7200
    );

    response.setData({
      errors: dataErorr,
      list: !list ? [] : list,
      is_new_order_app_food : is_new_order_app_food,
      is_new_order_online : is_new_order_online
    });
    
    return response;

  }

  async addJobTokenShopeeFoood(branchId : number , channelBranchId : string ,token : string) {
      
    // await this.foodChannelTokenQueueSHF.add(
    //   process.env
    //     .CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD,
    //   {
    //     ...{
    //       tokens: token,
    //     },
    //   },
    //   { jobId : `${branchId}-${channelBranchId}`,
    //     removeOnComplete: true,
    //     removeOnFail: true,
    //     delay: 0,
    //   }
    // );
  }

  async addJobTokenGrabFoood(branchId : number , channelBranchId : string ,token : string) {

  
    await this.foodChannelTokenQueueGRF.add(
      process.env
        .CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN_GRAB_FOOD,
      {
        ...{
          tokens: token,
        },
      },
      
      { jobId : `${branchId}-${channelBranchId}`,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 0,
      }
    );
  }

  async addJobTokenBeFoood(branchId : number , channelBranchId : string ,token : string) {
  
    await this.foodChannelTokenQueueBEF.add(
      process.env
        .CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD,
      {
        ...{
          tokens: token,
        },
      },
      {
        jobId : `${branchId}-${channelBranchId}`,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 0,
      }
    );
  }

  @GrpcMethod("ChannelOrderService", "getOrderDetail")
  async getDetail(query: { id: number; is_app_food: number }): Promise<any> {
    let response: ResponseData = new ResponseData();

    if (query.is_app_food == 1) {

      let result = await this.syncChannelOrdersService.spGOrderForGrpc(
        query.id,
        0,
        ""
      );

      let resultDeatail: any[];

      if (!result) {

        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Đơn hàng không tồn tại");
        return response;
       
      }

      resultDeatail = await this.syncChannelOrdersService.getDetails(
        query.id
      );



      response.setData({
        id: +result.id,
        channel_order_id: result.order_id,
        channel_order_code: result.order_code,
        channel_order_food_id: +result.channel_order_food_id,
        channel_branch_id: result.channel_branch_id,
        channel_branch_name: result?.channel_branch_name ?? "",
        channel_branch_address: result?.channel_branch_address ?? "",
        channel_branch_phone: result?.channel_branch_phone ?? "",
        total_amount: +result.total_amount,
        driver_name: result.driver_name,
        driver_avatar: result.driver_avatar,
        driver_phone: result.driver_phone,

        channel_order_food_name: result.channel_order_food_name,
        channel_order_food_code: result.channel_order_food_code,
        restaurant_id: 0,
        restaurant_brand_id: result.restaurant_brand_id
          ? +result.restaurant_brand_id
          : 0,
        branch_id: result.branch_id ? +result.branch_id : 0,
        order_id: result.restaurant_order_id ? +result.restaurant_order_id : 0,
        customer_id: result.customer_id ? result.customer_id : 0,
        table_id: result.table_id ? result.table_id : 0,
        area_id: result.area_id ? result.area_id : 0,
        table_name: result.table_name ? result.table_name : "",
        customer_name: result.customer_name ? result.customer_name : "",
        phone: result.customer_phone ? result.customer_phone : "",
        address: result.delivery_address ? result.delivery_address : "",
        note: result.note ? result.note : "",
        payment_method: result.payment_method ? result.payment_method : 0,
        payment_status: result.payment_status ? result.payment_status : 0,
        customer_order_status: result.customer_order_status
          ? result.customer_order_status
          : 0,
        customer_order_type: result.customer_order_type
          ? result.customer_order_type
          : 0,
        created_at: result.order_created_at ? result.order_created_at : "",
        updated_at: result.updated_at ? result.updated_at : "",
        shipping_fee: result.delivery_amount ? +result.delivery_amount : 0,
        tracking_url: result.tracking_url ? result.tracking_url : "",
        shippe_name: "", // Giá trị mặc định
        shipper_phone: result.shipper_phone ? result.shipper_phone : "",
        order_time: result.order_time ? +result.order_time : 0,
        cancel_comment: result.cancel_comment ? result.cancel_comment : "",
        restaurant_third_party_delivery_id:
          result.restaurant_third_party_delivery_id
            ? result.restaurant_third_party_delivery_id
            : 0,
        shipping_lat: result.shipping_lat ? result.shipping_lat : "",
        shipping_lng: result.shipping_lng ? result.shipping_lng : "",
        third_party_delivery_order_id: result.third_party_delivery_order_id
          ? result.third_party_delivery_order_id
          : "",
        third_party_delivery_name: result.third_party_delivery_name
          ? result.third_party_delivery_name
          : "",
        is_app_food: 1,
        display_id: result.display_id ? result.display_id : "",
        order_amount: result.order_amount ? +result.order_amount : 0,
        discount_amount: result.discount_amount ? +result.discount_amount : 0,
        customer_order_amount: result.customer_order_amount
          ? +result.customer_order_amount
          : 0,
        customer_discount_amount: result.customer_discount_amount
          ? +result.customer_discount_amount
          : 0,
        item_discount_amount: result?.item_discount_amount ?? 0,
        deliver_time: result?.deliver_time ?? "",
        is_scheduled_order: result?.is_scheduled_order ?? 0,
        is_cancel_printed : result?.is_cancel_printed ?? 0,
        is_cancel_order : result?.is_cancel_order ?? 0,
        details: resultDeatail.map((detail) => ({
          id: detail?.id ?? 0,
          customer_order_id: 0,
          food_id: detail?.food_id ?? "",
          food_name: detail?.food_name ?? "",
          order_detail_parent_id: 0,
          order_detail_combo_parent_id: 0,
          customer_order_detail_addition_ids: "[]",
          customer_order_detail_combo_ids: "[]",
          customer_order_detail_combo: "[]",
          customer_order_detail_addition: "[]",
          quantity: +detail?.quantity || 0,
          price: +detail?.food_price || 0,
          total_price: 0,
          is_addition: 0,
          is_combo: 0,
          note: detail?.food_note ?? "",
          total_price_addition: +detail?.food_price_addition || 0,
          created_at: "",
          updated_at: "",
          food_options: detail?.food_options ?? "[]",
          is_allow_print_stamp: +detail?.is_allow_print_stamp || 0,
          restaurant_kitchen_place_id: +detail?.restaurant_kitchen_place_id || 0,

        })),
      });


    }

    if (query.is_app_food == 0) {
      const data =
        await this.channelOrderFoodService.getDetailCustomerOrderOnline(
          query.id
        );

      if (data.status != HttpStatus.OK) {
        response.setStatus(data.status);
        response.setMessageError(data.message);
        return response;
      }

      response.setData(new CustomerOrderGrpcResponse(data.data));
    }

    return response;
  }

  @GrpcMethod("ChannelOrderService", "getOrderDetailV2")
  async getOrderDetailV2(query: { id: number; is_app_food: number }): Promise<any> {
    let response: ResponseData = new ResponseData();

    if (query.is_app_food == 1) {

      let result = await this.syncChannelOrdersService.spGOrderForGrpcV2(
        query.id,
        0,
        ""
      );

      let resultDeatail: any[];

      if (!result) {

        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Đơn hàng không tồn tại");
        return response;
       
      } else {
        resultDeatail = await this.syncChannelOrdersService.getDetails(
          query.id
        );
      }



      response.setData({
        id: +result.id,
        channel_order_id: result.order_id,
        channel_order_code: result.order_code,
        channel_order_food_id: +result.channel_order_food_id,
        channel_branch_id: result.channel_branch_id,
        channel_branch_name: result?.channel_branch_name ?? "",
        channel_branch_address: result?.channel_branch_address ?? "",
        channel_branch_phone: result?.channel_branch_phone ?? "",
        total_amount: +result.total_amount,
        driver_name: result.driver_name,
        driver_avatar: result.driver_avatar,
        driver_phone: result.driver_phone,

        channel_order_food_name: result.channel_order_food_name,
        channel_order_food_code: result.channel_order_food_code,
        restaurant_id: 0,
        restaurant_brand_id: result.restaurant_brand_id
          ? +result.restaurant_brand_id
          : 0,
        branch_id: result.branch_id ? +result.branch_id : 0,
        order_id: result.restaurant_order_id ? +result.restaurant_order_id : 0,
        customer_id: result.customer_id ? result.customer_id : 0,
        table_id: result.table_id ? result.table_id : 0,
        area_id: result.area_id ? result.area_id : 0,
        table_name: result.table_name ? result.table_name : "",
        customer_name: result.customer_name ? result.customer_name : "",
        phone: result.customer_phone ? result.customer_phone : "",
        address: result.delivery_address ? result.delivery_address : "",
        note: result.note ? result.note : "",
        payment_method: result.payment_method ? result.payment_method : 0,
        payment_status: result.payment_status ? result.payment_status : 0,
        customer_order_status: result.customer_order_status
          ? result.customer_order_status
          : 0,
        customer_order_type: result.customer_order_type
          ? result.customer_order_type
          : 0,
        created_at: result.order_created_at ? result.order_created_at : "",
        updated_at: result.updated_at ? result.updated_at : "",
        shipping_fee: result.delivery_amount ? +result.delivery_amount : 0,
        tracking_url: result.tracking_url ? result.tracking_url : "",
        shippe_name: "", // Giá trị mặc định
        shipper_phone: result.shipper_phone ? result.shipper_phone : "",
        order_time: result.order_time ? +result.order_time : 0,
        cancel_comment: result.cancel_comment ? result.cancel_comment : "",
        restaurant_third_party_delivery_id:
          result.restaurant_third_party_delivery_id
            ? result.restaurant_third_party_delivery_id
            : 0,
        shipping_lat: result.shipping_lat ? result.shipping_lat : "",
        shipping_lng: result.shipping_lng ? result.shipping_lng : "",
        third_party_delivery_order_id: result.third_party_delivery_order_id
          ? result.third_party_delivery_order_id
          : "",
        third_party_delivery_name: result.third_party_delivery_name
          ? result.third_party_delivery_name
          : "",
        is_app_food: 1,
        display_id: result.display_id ? result.display_id : "",
        order_amount: result.order_amount ? +result.order_amount : 0,
        discount_amount: result.discount_amount ? +result.discount_amount : 0,
        customer_order_amount: result.customer_order_amount
          ? +result.customer_order_amount
          : 0,
        customer_discount_amount: result.customer_discount_amount
          ? +result.customer_discount_amount
          : 0,
        item_discount_amount: result?.item_discount_amount ?? 0,
        deliver_time: result?.deliver_time ?? "",
        is_scheduled_order: result?.is_scheduled_order ?? 0,
        is_cancel_printed : result?.is_cancel_printed ?? 0,
        is_cancel_order : result?.is_cancel_order ?? 0,
        is_printed : result?.is_printed ?? 0,
        details: resultDeatail.map((detail) => ({
          id: detail?.id ?? 0,
          customer_order_id: 0,
          food_id: detail?.food_id ?? "",
          food_name: detail?.food_name ?? "",
          order_detail_parent_id: 0,
          order_detail_combo_parent_id: 0,
          customer_order_detail_addition_ids: "[]",
          customer_order_detail_combo_ids: "[]",
          customer_order_detail_combo: "[]",
          customer_order_detail_addition: "[]",
          quantity: +detail?.quantity || 0,
          price: +detail?.food_price || 0,
          total_price: 0,
          is_addition: 0,
          is_combo: 0,
          note: detail?.food_note ?? "",
          total_price_addition: +detail?.food_price_addition || 0,
          created_at: "",
          updated_at: "",
          food_options: detail?.food_options ?? "[]",
          is_allow_print_stamp: +detail?.is_allow_print_stamp || 0,
          restaurant_kitchen_place_id: +detail?.restaurant_kitchen_place_id || 0,

        })),
      });
    }

    if (query.is_app_food == 0) {
      const data =
        await this.channelOrderFoodService.getDetailCustomerOrderOnline(
          query.id
        );

      if (data.status != HttpStatus.OK) {
        response.setStatus(data.status);
        response.setMessageError(data.message);
        return response;
      }

      response.setData(new CustomerOrderGrpcResponse(data.data));
    }

    return response;
  }

  @GrpcMethod("ChannelOrderFoodReportService", "getListChannelOrderHistory")
  async getListChannelOrderHistory(channelOrderHistoryDto: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    food_channel_id: number;
    from_date: string;
    to_date: string;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();

    let result: StoreProcedureOutputResultInterface<
      ChannelOrderHistoryDataModel,
      ChannelOrderHistoryOutputDataModel
    > = await this.channelOrderFoodService.spGListChannelOrderHistory(
      channelOrderHistoryDto.restaurant_id,
      channelOrderHistoryDto.restaurant_brand_id,
      channelOrderHistoryDto.branch_id,
      channelOrderHistoryDto.food_channel_id,
      channelOrderHistoryDto.from_date,
      channelOrderHistoryDto.to_date
    );

    response.setData(
      new ChannelOrderHistoryOutputResponse(result.output, result.list)
    );

    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getChannelFoodRevenueSumaryReport"
  )
  async spGRpChannelFoodRevenueSumary(channelOrderRevenueSumaryDto: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    food_channel_id: number;
    hour_to_take_report: number;
    group_type: number;
    from_date: string;
    to_date: string;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();

    let result: StoreProcedureOutputResultInterface<
      ChannelFoodRevenueSumaryDataModel,
      ChannelFoodRevenueSumaryOutputDataModel
    > = await this.channelOrderFoodService.spGRpChannelFoodRevenueSumary(
      channelOrderRevenueSumaryDto.restaurant_id,
      channelOrderRevenueSumaryDto.restaurant_brand_id,
      channelOrderRevenueSumaryDto.branch_id,
      channelOrderRevenueSumaryDto.food_channel_id,
      channelOrderRevenueSumaryDto.hour_to_take_report,
      channelOrderRevenueSumaryDto.group_type,
      channelOrderRevenueSumaryDto.from_date,
      channelOrderRevenueSumaryDto.to_date
    );

    response.setData(
      new ChannelFoodRevenueSumarOutputResponse(result.output, result.list)
    );
    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getEarningSumaryReport"
  )
  async getEarningSumaryReport(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_branch_id: string;
    from_date: string;
    to_date: string;
  }): Promise<any> {

    let response: ResponseData = new ResponseData();

    let listToken = await this.syncChannelOrdersService.spGListTokenOfGrabfood(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.channel_branch_id
    );

    const dataGrpc = await this.channelOrderFoodApiService.getEarningSumaryReportGrpc(
      JSON.stringify(listToken),
      data.from_date,
      data.to_date,
    )

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return response;
    }

    response.setStatus(HttpStatus.OK);
    response.setData(dataGrpc.data);

    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getEarningSumaryReportV2"
  )
  async getEarningSumaryReporV2(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_branch_id: string;
    from_date: string;
    to_date: string;
  }): Promise<any> {

    let response: ResponseData = new ResponseData();

    let listToken = await this.syncChannelOrdersService.spGListTokenOfGrabfood(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.channel_branch_id
    );

    const dataGrpc = await this.channelOrderFoodApiService.getEarningSumaryReportV2Grpc(
      JSON.stringify(listToken),
      data.from_date,
      data.to_date,
    )

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return response;
    }

    response.setStatus(HttpStatus.OK);
    response.setData(dataGrpc.data);

    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "orderRefresh")
  async refresh(channelOrderRefreshDto: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    channel_orders: string;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();

    // console.log(
    //   `log nhận xử lý đơn treo - ${channelOrderRefreshDto.restaurant_id} - ${channelOrderRefreshDto.restaurant_brand_id
    //   } - ${channelOrderRefreshDto.branch_id}`
    // );

    let listToCheck = await this.syncChannelOrdersService.spGCheckOrderRefresh(
      channelOrderRefreshDto.branch_id,
      channelOrderRefreshDto.channel_orders
    );

    if (listToCheck.length > 0) {

      this.refreshStatusChannelOrderQueue.add(
        process.env
          .CONFIG_QUEUE_JOB_REDIS_FOOD_REFRESH_STATUS_CHANNEL_ORDER,
        {
          ...{
            branch_id: channelOrderRefreshDto.branch_id,
            channel_orders: listToCheck,
          },
        },
        {
          removeOnComplete: true,
          removeOnFail: true,
          delay: 0,
        }
      );
    }

    return response;
  }

  async syncTokenGRFGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodTokenId: number,
    urlLogin: string,
    urlUpdateDevice: string,
    usernamne: string,
    password: string,
    device_id: string,
    device_brand: string
  ): Promise<ChannelOrderFoodTokenEntity> {
    let dataGrpc =
      await this.channelOrderFoodApiService.reconnectionTokenGRFGrpc(
        urlLogin,
        urlUpdateDevice,
        usernamne,
        password,
        device_id,
        device_brand
      );

    if (dataGrpc.status != HttpStatus.OK) {
      return null;
    }

    let token = await this.channelOrderFoodTokenService.updateTokenGRF(
      channelOrderFoodTokenId,
      dataGrpc.data.access_token,
      "",
      ""
    );

    await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${restaurantId}-${restaurantBrandId}`);

    return token;
  }

  async syncTokenBEFGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodTokenId: number,
    urlLogin: string,
    usernamne: string,
    password: string
  ): Promise<ChannelOrderFoodTokenEntity> {
    let dataGrpc =
      await this.channelOrderFoodApiService.reconnectionTokenBefGrpc(
        urlLogin,
        usernamne,
        password
      );

    if (dataGrpc.status != HttpStatus.OK) {
      return null;
    }

    let token = await this.channelOrderFoodTokenService.updateTokenGRF(
      channelOrderFoodTokenId,
      dataGrpc.data.access_token,
      "",
      ""
    );

    await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${restaurantId}-${restaurantBrandId}`);

    return token;
  }

  @GrpcMethod("FoodChannelSettingService", "updateSettingFoodChannelBranch")
  async updateSettingFoodChannelBranch(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    quantity_slot_SHF: number;
    quantity_slot_GRF: number;
    quantity_slot_BEF: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let listCheck =
      await this.branchChannelFoodBranchMapsService.spGCheckSettingBranchMaps(
        data.branch_id,
        data.quantity_slot_SHF,
        data.quantity_slot_GRF,
        data.quantity_slot_BEF
      );

    if (listCheck.length > 0) {
      let dataGrpc =
        await this.branchChannelFoodBranchMapsService.updateSettingBranchGrpc(
          data.branch_id,
          JSON.stringify(listCheck)
        );
      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }

      await this.branchChannelFoodBranchMapsService.spUUpdateSettingBranch(
        data.branch_id,
        JSON.stringify(listCheck)
      );

      await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${data.restaurant_id}-${data.restaurant_brand_id}-${data.branch_id}`);

    }

    return response;
  }

  @GrpcMethod(
    "FoodChannelSettingService",
    "updateSettingFoodChannelRestaurantBrand"
  )
  async updateSettingFoodChannelRestaurantBrand(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    quantity_account_SHF: number;
    quantity_account_GRF: number;
    quantity_account_BEF: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let listCheck =
      await this.channelOrderFoodTokenService.spGCheckSettingFoodChannelRestaurantBrand(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.quantity_account_SHF,
        data.quantity_account_GRF,
        data.quantity_account_BEF
      );

    if (listCheck.length > 0) {
      let dataGrpc =
        await this.branchChannelFoodBranchMapsService.updateSettingFoodChannelRestaurantBrandGrpc(
          JSON.stringify(listCheck)
        );
      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }

      await this.channelOrderFoodTokenService.spUUpdateSettingFoodChannelRestaurantBrand(
        JSON.stringify(listCheck)
      );

      await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${data.restaurant_id}-${data.restaurant_brand_id}`);

    }

    return response;
  }


  @GrpcMethod(
    "ChannelOrderFoodService",
    "comfirmChannelOrder"
  )
  async comfirmChannelOrder(data: {
    restaurant_id: number;
    channel_order_id: number;
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:confirm-channel-order-${data.restaurant_id}-${data.channel_order_id}`, 2);

    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Vui lòng thử lại sau 2 giây");
      return response;
    }

    const channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.channel_order_id);

    if (!channelOrder || channelOrder.restaurant_id != data.restaurant_id) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Đơn hàng không hợp lệ");
      return response;
    }

    const token = await this.channelOrderFoodTokenService.spGInfoTokenToComfirmChannelOrder(
      channelOrder.restaurant_id,
      channelOrder.restaurant_brand_id,
      channelOrder.branch_id,
      channelOrder.channel_order_food_id,
      channelOrder.channel_order_food_token_id,
      channelOrder.channel_branch_id
    )

    if (token.message_error != "Success") {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError(token.message_error);
      return response;
    }

    let dataGrpc: any;

    if (token.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      dataGrpc = await this.channelOrderFoodApiService.confirmChannelOrderSHFGrpc(
        token.url_comfirm_order,
        token.access_token,
        `${token.channel_branch_id}`,
        `${token.merchant_id}`,
        token.channel_order_food_id,
        token.url_login,
        token.url_update_device,
        token.url_get_branch_detail,
        token.username,
        token.password,
        channelOrder.order_id,
        token.user_id,
        token.device_id,
        token.device_brand
      )
    }


    if (token.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      dataGrpc = await this.channelOrderFoodApiService.confirmChannelOrderGRFGrpc(
        token.url_comfirm_order,
        token.access_token,
        `${token.channel_branch_id}`,
        `${token.merchant_id}`,
        token.channel_order_food_id,
        token.url_login,
        token.url_update_device,
        token.url_get_branch_detail,
        token.username,
        token.password,
        channelOrder.order_id,
        token.user_id,
        token.device_id,
        token.device_brand
      )
    }

    if (token.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      dataGrpc = await this.channelOrderFoodApiService.confirmChannelOrderBEFGrpc(
        token.url_comfirm_order,
        token.access_token,
        `${token.channel_branch_id}`,
        `${token.merchant_id}`,
        token.channel_order_food_id,
        token.url_login,
        token.url_update_device,
        token.url_get_branch_detail,
        token.username,
        token.password,
        channelOrder.order_id,
        token.user_id,
        token.device_id,
        token.device_brand
      )
    }

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return response;
    }

    return response;
  }


  @GrpcMethod(
    "ChannelOrderService",
    "resetChannelOrder"
  )
  async resetChannelOrder(
    data: {
      restaurant_id: number;
      restaurant_brand_id: number,
      branch_id: number,
      channel_order_food_id: number;
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();


    await this.syncChannelOrdersService.spUResetToTest(data.restaurant_id,data.restaurant_brand_id,data.branch_id,data.channel_order_food_id);

    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getChannelFoodReport"
  )
  async getChannelFoodReport(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      branch_id: number,
      hour_to_take_report: number,
      from_date_string: string,
      to_date_string: string,
      key_search: string,
      limit: number,
      offset: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    const result = await this.channelOrderFoodService.spGRpChannelFoodMenu(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.hour_to_take_report,
      data.from_date_string,
      data.to_date_string,
      data.key_search,
      data.limit,
      data.offset
    );

    response.setData(
      new ChannelFoodMenuReportOutputResponse(result.output, result.list, data.limit)
    );

    return response;
  }

  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getChannelFoodSumaryDataReport"
  )
  async getChannelFoodSumaryDataReport(data: {
    restaurant_id: number;
    restaurant_brand_id: number;
    branch_id: number;
    food_channel_id: number;
    hour_to_take_report: number;
    group_type: number;
    from_date: string;
    to_date: string;
  }): Promise<any> {
    let response: ResponseData = new ResponseData();

    let result: ChannelFoodSumaryDataModel = await this.channelOrderFoodService.spGRpChannelFoodSumaryData(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.food_channel_id,
      data.hour_to_take_report,
      data.group_type,
      data.from_date,
      data.to_date
    );

    response.setData(
      new ChannelFoodSumaryDataResponse(result)
    );
    return response;
  }


  @GrpcMethod(
    "ChannelOrderFoodReportService",
    "getChannelFoodOrdersReport"
  )
  async getChannelFoodOrdersReport(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      branch_id: number,
      channel_order_food_id: number,
      hour_to_take_report: number,
      from_date: string,
      to_date: string,
      key_search: string,
      offset: number,
      limit: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    const result = await this.channelOrderFoodService.spGRpChannelOrders(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.channel_order_food_id,
      data.hour_to_take_report,
      data.from_date,
      data.to_date,
      data.key_search,
      data.offset,
      data.limit
    );

    response.setData(
      new ChannelFoodOrderReportOutputResponse(result.output, result.list, data.limit)
    );

    return response;
  }

  @Get("/test")
  async test(
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    await this.channelOrderFoodService.syncChannelOrderToMysql(2244, 2982, 3718, 2, '[]');

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/health-check")
  async healthCheck(
    @Query("channel_order_food_id") channelOrderFoodId: number = -1,
    @Res() res: Response,
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let data: HealthCheckGRPCResponse;
    if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      data = await this.channelOrderFoodService.healthCheckShfGrpc();
    }

    if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      data = await this.channelOrderFoodService.healthCheckGrfGrpc();
    }

    if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      data = await this.channelOrderFoodService.healthCheckBefGrpc();
    }

    response.setStatus(data.status);
    response.setMessageError(data.message);

    return res.status(HttpStatus.OK).send(response);
  }

  @GrpcMethod(
    "ChannelOrderService",
    "syncOrdersMongo"
  )
  async syncOrdersMongo(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      branch_id: number,
      channel_order_food_id: number,
      access_tokens: string
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    // console.log(`Đồng bộ đơn hàng bằng grpc : ${data.restaurant_id}-${data.restaurant_brand_id}-${data.branch_id}-${data.channel_order_food_id}`);

    await this.channelOrderFoodService.syncChannelOrderToMysqlV2(
      data.branch_id
    );

    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "handleCompleteChannelOrder"
  )
  async handleCompleteChannelOrder(
    data: {
      restaurant_id: number,
      id: number,
      channel_order_food_id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder || channelOrder.restaurant_id != data.restaurant_id) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Đơn hàng không hợp lệ");
      return response;
    }

    if (channelOrder.restaurant_order_id > 0) {

      const dataCompleteOrderGrpc = await this.channelOrderFoodService.completeOrderGrpc(
        JSON.stringify([{
          restaurant_order_id: channelOrder.restaurant_order_id,
          driver_name: channelOrder.driver_name,
          driver_phone: channelOrder.driver_phone,
        }])
      );

      if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError(dataCompleteOrderGrpc.message);
        return response;
      }
    };

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_COMPLETED;
    };

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_COMPLETED;
    };

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_COMPLETED;
    };

    channelOrder.is_grpc_complete = 1;

    await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);


    console.log('Check request done order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);
  
    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "handleCompleteChannelOrderV2"
  )
  async handleCompleteChannelOrderV2(
    data: {
      restaurant_id: number,
      id: number,
      restaurant_order_id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder) {

      const dataCompleteOrderGrpc = await this.channelOrderFoodService.completeOrderGrpc(
        JSON.stringify([{
          restaurant_order_id: data.restaurant_order_id,
          driver_name: "",
          driver_phone: "",
        }])
      );

      if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError(dataCompleteOrderGrpc.message);
        return response;
      }

    }else {

      if (channelOrder.restaurant_order_id > 0) {

        const dataCompleteOrderGrpc = await this.channelOrderFoodService.completeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: channelOrder.restaurant_order_id,
            driver_name: channelOrder.driver_name,
            driver_phone: channelOrder.driver_phone,
          }])
        );

        if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCompleteOrderGrpc.message);
          return response;
        }
      };

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
        channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_COMPLETED;
      };

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
        channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_COMPLETED;
      };

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
        channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_COMPLETED;
      };

      channelOrder.is_grpc_complete = 1;

      await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);

      await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);
      await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);

      console.log('Check request done order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);

    }
  
    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "handleCompleteChannelOrderV3"
  )
  async handleCompleteChannelOrderV3(
    data: {
      restaurant_id: number,
      id: number,
      restaurant_order_id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder) {

      if(data.restaurant_order_id > 0 ){

        const dataCompleteOrderGrpc = await this.channelOrderFoodService.completeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: data.restaurant_order_id,
            driver_name: "",
            driver_phone: "",
          }])
        );

        if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCompleteOrderGrpc.message);
          return response;
        }
      }

    }else {

      if (channelOrder.restaurant_order_id > 0) {

        const dataCompleteOrderGrpc = await this.channelOrderFoodService.completeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: channelOrder.restaurant_order_id,
            driver_name: channelOrder.driver_name,
            driver_phone: channelOrder.driver_phone,
          }])
        );

        if (dataCompleteOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCompleteOrderGrpc.message);
          return response;
        }

        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
          channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_COMPLETED;
        };
  
        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
          channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_COMPLETED;
        };
  
        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
          channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_COMPLETED;
        };
  
        channelOrder.is_grpc_complete = 1;
  
        await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);
  
      }else{
        await this.updateRestaurantOrderIdsV3(data.id,channelOrder.branch_id,0);
      }
      
      await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);
      await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);

      console.log('Check request done order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);

    }
  
    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "handleCancelChannelOrder"
  )
  async handleCancelChannelOrder(
    data: {
      restaurant_id: number,
      id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder || channelOrder.restaurant_id != data.restaurant_id) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Đơn hàng không hợp lệ");
      return response;
    }

    if (channelOrder.restaurant_order_id > 0) {

      const dataCloseOrderGrpc = await this.channelOrderFoodService.closeOrderGrpc(
        JSON.stringify([{
          restaurant_order_id: channelOrder.restaurant_order_id,
          driver_name: channelOrder.driver_name,
          driver_phone: channelOrder.driver_phone,
        }])
      );

      if (dataCloseOrderGrpc.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError(dataCloseOrderGrpc.message);
        return response;
      }
    }

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
      channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_CANCELLED;
    };

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
      channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_CANCELLED;
    };

    if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
      channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_CANCELLED;
    };

    channelOrder.is_grpc_complete = 1;

    await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);

    console.log('Check request cancel order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);

    return response;
  }


  @GrpcMethod(
    "ChannelOrderService",
    "handleCancelChannelOrderV2"
  )
  async handleCancelChannelOrderv2(
    data: {
      restaurant_id: number,
      id: number,
      restaurant_order_id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder) {

      const dataCloseOrderGrpc = await this.channelOrderFoodService.closeOrderGrpc(
        JSON.stringify([{
          restaurant_order_id: data.restaurant_order_id,
          driver_name: "",
          driver_phone: "",
        }])
      );

      if (dataCloseOrderGrpc.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError(dataCloseOrderGrpc.message);
        return response;
      }
      
    }else{

      if (channelOrder.restaurant_order_id > 0) {

        const dataCloseOrderGrpc = await this.channelOrderFoodService.closeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: channelOrder.restaurant_order_id,
            driver_name: channelOrder.driver_name,
            driver_phone: channelOrder.driver_phone,
          }])
        );

        if (dataCloseOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCloseOrderGrpc.message);
          return response;
        }
      }

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
        channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_CANCELLED;
      };

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
        channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_CANCELLED;
      };

      if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
        channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_CANCELLED;
      };

      channelOrder.is_grpc_complete = 1;

      await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);

      await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);
      await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);

      console.log('Check request cancel order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);

    }

    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "handleCancelChannelOrderV3"
  )
  async handleCancelChannelOrderv3(
    data: {
      restaurant_id: number,
      id: number,
      restaurant_order_id: number
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let channelOrder = await this.syncChannelOrdersService.findOneChannelOrderById(data.id);

    if (!channelOrder) {

      if (data.restaurant_order_id > 0) {

        const dataCloseOrderGrpc = await this.channelOrderFoodService.closeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: data.restaurant_order_id,
            driver_name: "",
            driver_phone: "",
          }])
        );

        if (dataCloseOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCloseOrderGrpc.message);
          return response;
        }
    }
      
    }else{

      if (channelOrder.restaurant_order_id > 0) {

        const dataCloseOrderGrpc = await this.channelOrderFoodService.closeOrderGrpc(
          JSON.stringify([{
            restaurant_order_id: channelOrder.restaurant_order_id,
            driver_name: channelOrder.driver_name,
            driver_phone: channelOrder.driver_phone,
          }])
        );

        if (dataCloseOrderGrpc.status != HttpStatus.OK) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError(dataCloseOrderGrpc.message);
          return response;
        }

        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
          channelOrder.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_CANCELLED;
        };
  
        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
          channelOrder.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_CANCELLED;
        };
  
        if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
          channelOrder.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_CANCELLED;
        };
  
        channelOrder.is_grpc_complete = 1;
  
        await this.syncChannelOrdersService.updateChannelOrderV2(channelOrder);

      }else{
        
        let channelOrderPrint : ChannelOrderPrintEntity= await this.syncChannelOrdersService.findOneChannelOrderPrintByChannelOrderId(channelOrder.id);

        if(channelOrderPrint.is_printed == 0){
          await this.syncChannelOrdersService.updateCannelPrintsByChannelOrderIds([channelOrder.id]);

          await this.updateRestaurantOrderIdsV3(channelOrder.id,channelOrder.branch_id,1);
        }

        if(channelOrderPrint.is_printed == 1){

          let channelOrderDriver : ChannelOrderDriverEntity= await this.syncChannelOrdersService.findOneChannelOrderDriverByChannelOrderId(channelOrder.id);

          if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
            channelOrderDriver.status_string = ChannelOrderFoodStatusEnum.GRAB_FOOD_STATUS_CANCELLED;
          };
    
          if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
            channelOrderDriver.order_status = +ChannelOrderFoodStatusEnum.SHOPEE_FOOD_STATUS_CANCELLED;
          };
    
          if (channelOrder.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
            channelOrderDriver.order_status = +ChannelOrderFoodStatusEnum.BE_FOOD_STATUS_CANCELLED;
          };
        
          await this.syncChannelOrdersService.updateChannelOrderDriver(channelOrderDriver);
        }
      }

      await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);
      await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}-${channelOrder.restaurant_brand_id}-${channelOrder.branch_id}`);

      console.log('Check request cancel order food-channel: branch_id',channelOrder.branch_id,'id',data.id,'order_id',channelOrder.order_id);

    }

    return response;
  }


  @GrpcMethod(
    "ChannelOrderFoodService",
    "deleteRedisFoodChannelFoodTechresMap"
  )
  async deleteRedisFoodChannelFoodTechresMap(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      branch_id: number,
      channel_order_food_id: number,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    await this.redisService.deleteKey(`food_channel_processor:food-channel-food-TechRes-map-${data.restaurant_id}-${data.restaurant_brand_id}-${data.branch_id}`)

    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "batchConfirmChannelOrder"
  )
  async batchConfirmChannelOrder(
    data: {
      restaurant_id: number,
      branch_id: number,
      ids: string,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(JSON.parse(data.ids).length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}-${data.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}`, 3);
    }


    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    await this.syncChannelOrdersService.updateByRestaurantAndIds(data.restaurant_id, JSON.parse(data.ids));
    // await this.syncChannelOrdersService.updatePrintsByChannelOrderIds(JSON.parse(data.ids));

    const dataResult = await this.updateRestaurantOrderIds(data.restaurant_id, data.branch_id, data.ids);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);

    response.setData(dataResult ?? '[]');
    
    return response;
  }

  async updateRestaurantOrderIds(
    restaurant_id: number, branch_id: number, ids: string,
  ): Promise<any> {

    let dataList = await this.syncChannelOrdersService.spGListChannelOrderByIds(restaurant_id, ids);

    if(dataList.length > 0 ){

      const dataGrpc = await this.channelOrderFoodService.confirmOrderChannelGrpc(
        branch_id,
        new ChannelOrderByIdsResponse().mapToList(dataList)
      );

      let idsUpdate: any[] = [];
      
      if (dataGrpc && dataGrpc.status == HttpStatus.OK) {
        const a = JSON.parse(dataGrpc.data.channel_order_update_json ?? '[]');

        if(!(a.length == 0)){
          idsUpdate = [...a.success_list, ...a.exit_list];
        }
      }    
      
      const dataResultUpdate = JSON.parse(ids).map(channelOrderId => {
        const match = idsUpdate.find(item => +item.channel_order_id === +channelOrderId);
        return {
          channel_order_id: +channelOrderId,
          restaurant_order_id: match ? match.restaurant_order_id : 0,
        };
      });      

      const data = JSON.stringify(dataResultUpdate);

      // console.log(branch_id,ids,"GRPC :",JSON.stringify(dataGrpc),"RESULT :",data);

      await this.syncChannelOrdersService.spUUpdateRestaurantOrderIds(restaurant_id, data);

      return data;

    }
  }

  @GrpcMethod(
    "ChannelOrderService",
    "batchConfirmChannelOrderV2"
  )
  async batchConfirmChannelOrderV2(
    data: {
      restaurant_id: number,
      branch_id: number,
      ids: string,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(JSON.parse(data.ids).length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}-${data.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}`, 3);
    }


    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    await this.syncChannelOrdersService.updatePrintsByChannelOrderIds(JSON.parse(data.ids));

    const dataResult = await this.updateRestaurantOrderIdsV2(data.restaurant_id, data.branch_id, data.ids);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);

    response.setData(dataResult ?? '[]');
    
    return response;
  }

  async updateRestaurantOrderIdsV2(
    restaurant_id: number, branch_id: number, ids: string,
  ): Promise<any> {

    let dataList = await this.syncChannelOrdersService.spGListChannelOrderByIdsV2(restaurant_id, ids);

    if(dataList.length > 0 ){

      const dataGrpc = await this.channelOrderFoodService.confirmOrderChannelGrpc(
        branch_id,
        new ChannelOrderByIdsResponse().mapToList(dataList)
      );

      let idsUpdate: any[] = [];
      
      if (dataGrpc && dataGrpc.status == HttpStatus.OK) {
        const a = JSON.parse(dataGrpc.data.channel_order_update_json ?? '[]');

        if(!(a.length == 0)){
          idsUpdate = [...a.success_list, ...a.exit_list];
        }
      }    
      
      const dataResultUpdate = JSON.parse(ids).map(channelOrderId => {
        const match = idsUpdate.find(item => +item.channel_order_id === +channelOrderId);
        return {
          channel_order_id: +channelOrderId,
          restaurant_order_id: match ? match.restaurant_order_id : 0,
        };
      });      

      const data = JSON.stringify(dataResultUpdate);

      // console.log('dataGrpc',dataGrpc.data,'dataResultUpdate',dataResultUpdate);

      // console.log(branch_id,ids,"GRPC :",JSON.stringify(dataGrpc),"RESULT :",data);

      await this.syncChannelOrdersService.spUUpdateRestaurantOrderIds(restaurant_id, data);

      return data;

    }
  }


  @GrpcMethod(
    "ChannelOrderService",
    "updateCancelPrintOrders"
  )
  async updateCancelPrintOrders(
    data: {
      restaurant_id: number,
      branch_id: number,
      ids: string,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(JSON.parse(data.ids).length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-cannelPrint-${data.restaurant_id}-${data.branch_id}-${data.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-cannelPrint-${data.restaurant_id}-${data.branch_id}`, 3);
    }

    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    await this.syncChannelOrdersService.updateCannelPrintOrders(data.restaurant_id, JSON.parse(data.ids));
    // await this.syncChannelOrdersService.updateCannelPrintsByChannelOrderIds(JSON.parse(data.ids));

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);

    return response;
  }

  @GrpcMethod(
    "ChannelOrderService",
    "updateCancelPrintOrdersV2"
  )
  async updateCancelPrintOrdersV2(
    data: {
      restaurant_id: number,
      branch_id: number,
      ids: string,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(JSON.parse(data.ids).length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-cannelPrint-${data.restaurant_id}-${data.branch_id}-${data.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-cannelPrint-${data.restaurant_id}-${data.branch_id}`, 3);
    }

    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    await this.syncChannelOrdersService.updateCannelPrintsByChannelOrderIds(JSON.parse(data.ids));

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);

    return response;
  }

  @GrpcMethod("ChannelOrderService", "getOrderDetailToPrint")
  async getOrderDetailToPrint(query: { id: number; restaurant_id: number }): Promise<any> {
    let response: ResponseData = new ResponseData();


    const data = await this.syncChannelOrdersService.spGChannelOrderDetailToPrint(query.restaurant_id, query.id);

    if(!data){
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Đơn này không tồn tại");
      return response;
    }

    response.setData(new CustomerOrderResponse(data));
    

    return response;
  }

  @GrpcMethod("ChannelOrderService", "getOrderDetailToPrintV2")
  async getOrderDetailToPrintV2(query: { id: number; restaurant_id: number }): Promise<any> {
    let response: ResponseData = new ResponseData();    

    const data = await this.syncChannelOrdersService.spGChannelOrderDetailToPrintV2(query.restaurant_id, query.id);

    if(!data){
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Đơn này không tồn tại");
      return response;
    }

    response.setData(new CustomerOrderResponse(data));
    

    return response;
  }


  @Post("/orders/batch-confirm")
  async batchConfirmChannelOrderHttp(
    @Body() dto : BatchConfirmChannelOrderDto,
    @Res() res: Response
  ): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(dto.ids.length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${dto.restaurant_id}-${dto.branch_id}-${dto.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${dto.restaurant_id}-${dto.branch_id}`, 3);
    }

    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return res.status(HttpStatus.OK).send(response);
    }

    await this.syncChannelOrdersService.updatePrintsByChannelOrderIds(dto.ids);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${dto.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${dto.restaurant_id}`);

    return res.status(HttpStatus.OK).send(response);
  }

  @GrpcMethod(
    "ChannelOrderService",
    "batchConfirmChannelOrderV3"
  )
  async batchConfirmChannelOrderV3(
    data: {
      restaurant_id: number,
      branch_id: number,
      ids: string,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    
    let isSpam = false ; 
    if(JSON.parse(data.ids).length == 1){
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}-${data.ids}`, 3);
    }else{
      isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:anti-spam-batchconfirm-${data.restaurant_id}-${data.branch_id}`, 3);
    }


    if (isSpam) {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    await this.syncChannelOrdersService.updatePrintsByChannelOrderIds(JSON.parse(data.ids));

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-order-${data.restaurant_id}`);
    await this.redisService.deleteKeysWithPrefix(`food_channel_controller:get-channel-order-${data.restaurant_id}`);
    
    return response;
  }

  async updateRestaurantOrderIdsV3(
      id: number,
      branchId : number,
      isCancel : number
  ): Promise<any> {

    let dataOrder : ChannelOrderByIdDataModel = await this.syncChannelOrdersService.spGChannelOrderById(id, isCancel);

    const dataList : ChannelOrderByIdResponse[] = [];
    dataList.push(new ChannelOrderByIdResponse(dataOrder));
    
    if(dataList.length > 0 ){

      const dataGrpc = await this.channelOrderFoodService.confirmOrderChannelGrpcV2(
        branchId,
        dataList
      );

      let idsUpdate: any[] = [];
      
      if (dataGrpc && dataGrpc.status == HttpStatus.OK) {
        const a = JSON.parse(dataGrpc.data.channel_order_update_json ?? '[]');

        if(!(a.length == 0)){
          idsUpdate = [...a.success_list, ...a.exit_list];
        }
      }    
      
      const dataResultUpdate = [id].map(channelOrderId => {
        const match = idsUpdate.find(item => +item.channel_order_id === +channelOrderId);
        return {
          channel_order_id: +channelOrderId,
          restaurant_order_id: match ? match.restaurant_order_id : 0,
        };
      });      

      // const data = JSON.stringify(dataResultUpdate);      

      await this.channelOrderFoodService.spUUpdateChannelOrderCompleteGrpcV2(JSON.stringify(dataResultUpdate));
      await this.channelOrderFoodService.updateCompleteOrdersByChannelOrderId(id);
      // return data;

    }
  }
}
