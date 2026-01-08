import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { VersionEnum } from "src/utils.common/utils.enum/utils.version.enum";
import { ChannelOrderFoodService } from "./channel-order-food.service";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { GetUser } from "src/utils.common/utils.decorator.common/utils.decorator.common";
import { GrpcMethod } from "@nestjs/microservices";
import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
import { ChannelOrderRefreshDto } from "./dto/channel-order-refresh.dto";
import { ChannelOrderHistoryDto } from "./dto/channel-order-history.dto";
import { StoreProcedureGetReportTimeDatabase } from "src/utils.common/utils.format-time.common/utils.format-store-procdure.get.time.database";
import { ChannelOrderHistoryOutputResponse } from "./response/channel-order-history.output.response";
import { ChannelOrderRevenueSumaryDto } from "./dto/channel-order-revenue-sumary.dto";
import { ChannelFoodRevenueSumarOutputResponse } from "./response/channel-food-revenue-sumary.output.response";
import { CustomerOrderResponse } from "./response/customer-order-response";
import { UserValidateToken } from "src/utils.common/utils.middleware.common/user-validate-token";
import { ChannelFoodReportDto } from "./dto/channel-food-report.dto";
import { Pagination } from "src/utils.common/utils.pagination.pagination/utils.pagination";
import { SyncChannelBranchDTO } from "./dto/sync-channel-branch.dto";
import { ChannelFoodSumaryDataResponse } from "./response/channel-food-sumary-data.response";
import { ChannelFoodOrderReportDto } from "./dto/channel-food-order-report.dto";
import { ChannelFoodEarningSuamryReportDto } from "./dto/channel-food-earning-sumary-report.dto";
import { ChannelFoodEarningSumaryReportResponse } from "./response/channel-food-earning-sumary-report.response";
import { UtilsDate } from "src/utils.common/utils.format-time.common/utils.format-time.common";
import { BatchConfirmChannelOrderDto } from "./dto/batch-confirm-channel-order.dto";
import { HandleStatusChannelOrderDTO } from "./dto/handle-status-channel-order";
import { RedisService } from "src/redis/redis.service";

@Controller({
  version: VersionEnum.V3.toString(),
  path: "channel-order-foods",
})
@ApiBearerAuth()
export class ChannelOrderFoodController {
  static getBranchesChannelOrderFood: any;

  constructor(
    private readonly channelOrderFoodService: ChannelOrderFoodService,
    private readonly redisService: RedisService,

  ) { }


  @GrpcMethod("ChannelOrderFoodService", "findById")
  async findById(data: { id: number }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.findByIdGrpc(data.id);

    response.setData(result.data)

    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getFoodsChannelOrderFood")
  async getFoodsChannelOrderFood(data: { restaurant_id: number, restaurant_brand_id: number, channel_order_food_id: number, channel_branch_id: string }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.getFoodsChannelOrderFoodGrpc(data.restaurant_id, data.restaurant_brand_id, data.channel_order_food_id, data.channel_branch_id);

    response.setStatus(result.status);
    response.setData(result.data);
    response.setMessageError(result.message);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getFoodToppings")
  async getFoodToppings(data: { restaurant_id: number, restaurant_brand_id: number, channel_order_food_id: number, channel_branch_id: string }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.getFoodToppingsGrpc(data.restaurant_id, data.restaurant_brand_id, data.channel_order_food_id, data.channel_branch_id);    

    response.setStatus(result.status);
    response.setData(result.data);
    response.setMessageError(result.message);
    return response;
  }


  @GrpcMethod("ChannelOrderFoodService", "updateFoodPrices")
  async updateFoodPrices(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      channel_order_food_id: number,
      channel_branch_id: string,
      foods: [{
        id: string,
        price: string
      }]
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.updateFoodPrices(data.restaurant_id, data.restaurant_brand_id, data.channel_order_food_id, data.channel_branch_id, data.foods);

    response.setStatus(result.status);
    response.setData(result.data);
    response.setMessageError(result.message);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "getBranchesChannelOrderFood")
  async getBranchesChannelOrderFood(data: { restaurant_id: number, restaurant_brand_id: number, channel_order_food_id: number }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.getBranchesChannelOrderFoodGrpc(data.restaurant_id, data.restaurant_brand_id, data.channel_order_food_id);

    response.setStatus(result.status);
    response.setData(result.data);
    response.setMessageError(result.message);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "syncAssignBranch")
  async syncAssignBranch(data: { restaurant_id: number, restaurant_brand_id: number, channel_order_food_id: number, branch_maps: string }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.syncAssignBranchGrpc(data.restaurant_id, data.restaurant_brand_id, data.channel_order_food_id, data.branch_maps);

    response.setStatus(result.status);
    response.setMessageError(result.message);
    return response;
  }

  @GrpcMethod("ChannelOrderFoodService", "syncAssignMultipleChannelBranch")
  async syncAssignMultipleChannelBranch(data: { restaurant_id: number, restaurant_brand_id: number, branch_id: number, channel_order_food_id: number, branch_maps: string }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.syncAssignMultipleChannelBranchGrpc(
      data.restaurant_id, data.restaurant_brand_id, data.branch_id, data.channel_order_food_id, data.branch_maps);

    response.setStatus(result.status);
    response.setMessageError(result.message);
    return response;
  }

  @GrpcMethod("OrderChannelOrderFoodService", "getDetailBillAppFood")
  async getDetailBillAppFood(data: { channel_order_food_id: number, channel_order_food_code: string }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.getDetailBillAppFoodGrpc(data.channel_order_food_id, data.channel_order_food_code);

    response.setStatus(result.status);
    response.setMessageError(result.message);
    response.setData(result.data);

    return response;
  }

  @Get("/list")
  @ApiOperation({ summary: "Lấy danh sách đối tác kết nối với thương hiệu" })
  @ApiResponse({ status: 200, description: "Successful operation" })
  @ApiQuery({
    name: "restaurant_id",
    required: true,
    type: Number,
    description: "Id nhà hàng",
  })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  @ApiQuery({
    name: "key_search",
    required: false,
    type: String,
    description: "Từ khoá tìm kiếm ",
  })
  @ApiQuery({
    name: "channel_order_food_id",
    required: false,
    type: Number,
    description: "Id đối tác tích hợp",
  })
  @ApiQuery({
    name: "is_connect",
    required: false,
    type: Number,
    description: "Trạng thái kết nối giữa thương hiệu với đối tác",
  })
  async getList(
    @Query("restaurant_brand_id") restaurant_brand_id: number = 0,
    @Query("channel_order_food_id") channel_order_food_id: number = -1,
    @Query("is_connect") is_connect: number = -1,
    @Query("key_search") key_search: string = "",
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {    

    let response: ResponseData = new ResponseData();

    const data = await this.channelOrderFoodService.getListChannelOrderFoodGrpc(
      user.restaurant_id,
      restaurant_brand_id,
      channel_order_food_id,
      is_connect,
      key_search
    );

    if (data.status != HttpStatus.OK) {
      response.setStatus(data.status);
      response.setMessageError(data.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(data.data);

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/orders")
  @ApiOperation({
    summary: "Lấy danh sách đơn hàng đối tác kết nối với thương hiệu",
  })
  @ApiResponse({ status: 200, description: "Successful operation" })
  @ApiQuery({
    name: "restaurant_id",
    required: true,
    type: Number,
    description: "Id nhà hàng",
  })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  @ApiQuery({
    name: "branch_id",
    required: true,
    type: Number,
    description: "Id chi nhánh",
  })
  @ApiQuery({
    name: "channel_order_food_id",
    required: false,
    type: Number,
    description: "Id đối tác tích hợp",
  })
  @ApiQuery({
    name: "customer_order_status",
    required: false,
    type: Number,
    description: "Trạng thái đơn hàng",
  })
  async getOrders(
    @Query("restaurant_brand_id") restaurantBrandId: number = 0,
    @Query("branch_id") branchId: number = 0,
    @Query("channel_order_food_id") channelOrderFoodId: number = -1,
    @Query("customer_order_status") customerOrderStatus: string = "",
    @Query("is_have_restaurant_order") isHaveRestaurantOrder: number = -1,
    @Query("is_app_food") isAppFood: number = -1,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    const timeBegin = new Date();

    let keyGetChannelOrder = `food_channel_controller:get-channel-order-${user.restaurant_id}-${restaurantBrandId}-${branchId}-${channelOrderFoodId}-${customerOrderStatus}-${isHaveRestaurantOrder}-${isAppFood}-v3`;  

    let listChannelOrders = await this.redisService.getKey(
      keyGetChannelOrder
    );

    if (!listChannelOrders) {

      let dataToCheckRedis = await this.channelOrderFoodService.checkFoodChannelValidatorRedisGrpc(user.restaurant_id, restaurantBrandId, branchId);    

      if (dataToCheckRedis.status != HttpStatus.OK) {
        response.setStatus(dataToCheckRedis.status);
        response.setMessageError(dataToCheckRedis.message);
        response.setData({
          errors: [],
          list: []
        });
        return res.status(HttpStatus.OK).send(response);
      }        
            
      let dataOrderGrpc = await this.channelOrderFoodService.getOrdersGrpcV2(
        user.restaurant_id,
        restaurantBrandId,
        branchId,
        channelOrderFoodId,
        customerOrderStatus,
        isHaveRestaurantOrder,
        isAppFood,
        dataToCheckRedis.data?.is_active ?? 0,
        JSON.stringify(dataToCheckRedis.data?.tokens ?? []),
        dataToCheckRedis.data?.is_use_kafka ?? 0
      )

      if (dataOrderGrpc.status != HttpStatus.OK) {
        response.setStatus(dataOrderGrpc.status);
        response.setMessageError(dataOrderGrpc.message);
        response.setData({
          errors: [],
          list: []
        });
        return res.status(HttpStatus.OK).send(response);
      }    

      const pag =  await new Pagination(page, limit);
      
      response.setData({
        total_record : dataOrderGrpc.data.list?.length ?? 0,
        errors: !dataOrderGrpc.data.errors ? [] : dataOrderGrpc.data.errors,
        list: new CustomerOrderResponse().mapToList(!dataOrderGrpc.data.list ? [] : dataOrderGrpc.data.list.slice(pag.getOffset(),(pag.getOffset() + Number(limit))))
      })
      
      await this.redisService.setKeyGetChannelOrder(
        keyGetChannelOrder,
        JSON.stringify(response.getData())
      ); 

    }else{

      response.setData(
        JSON.parse(listChannelOrders)
      )

    }

    console.log(`Log time v3: ${user.restaurant_id} - ${restaurantBrandId} - ${branchId} - begin( ${timeBegin} ) - end( ${new Date()} )`);
    

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/order-detail")
  @ApiOperation({
    summary: "Lấy danh sách đơn hàng đối tác kết nối với thương hiệu",
  })
  @ApiResponse({ status: 200, description: "Successful operation " })
  @ApiQuery({
    name: "restaurant_id",
    required: true,
    type: Number,
    description: "Id nhà hàng",
  })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  async getDetail(
    @Query("id") id: number = 0,
    @Query("is_app_food") isAppFood: number = 0,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();
    
    let dataGrpc = await this.channelOrderFoodService.getOrderDetailGrpc(
      id,
      isAppFood,
      user.restaurant_id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }    

    response.setData(new CustomerOrderResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Post('/order/refresh')
  @ApiOperation({ summary: 'Api refresh đơn đối tác' })
  @ApiResponse({ status: 200, description: 'Successful' })
  async refresh(
    @Body() channelOrderRefreshDto: ChannelOrderRefreshDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response,
  ): Promise<any> {

    let response: ResponseData = new ResponseData();
    
    let dataRefresh = await this.channelOrderFoodService.orderRefreshGrpc(
      user.restaurant_id,
      channelOrderRefreshDto.restaurant_brand_id,
      channelOrderRefreshDto.branch_id,
      JSON.stringify(channelOrderRefreshDto.channel_orders)
    );

    if (dataRefresh.status != HttpStatus.OK) {
      response.setStatus(dataRefresh.status);
      response.setMessageError(dataRefresh.message);
      return res.status(HttpStatus.OK).send(response);
    }

    return res.status(HttpStatus.OK).send(response);

  }

  @Get("/order/history")
  @ApiOperation({ summary: "Lịch sử đơn hàng food channel" })
  @ApiResponse({ status: 200, description: 'Successful' })
  async history(
    @Query() channelOrderHistoryDto: ChannelOrderHistoryDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      channelOrderHistoryDto.report_type,
      channelOrderHistoryDto.date_string,
      channelOrderHistoryDto.from_date,
      channelOrderHistoryDto.to_date
    ).getReportTimeDatabase();

    let dataGrpc = await this.channelOrderFoodService.getListChannelOrderHistoryGrpc(
      user.restaurant_id,
      channelOrderHistoryDto.restaurant_brand_id,
      channelOrderHistoryDto.branch_id,
      channelOrderHistoryDto.food_channel_id,
      time.from_date,
      time.to_date
    )

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(new ChannelOrderHistoryOutputResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/revenue-sumary")
  @ApiOperation({ summary: "Báo cáo doanh thu food channel" })
  @ApiResponse({ status: 200, description: 'Successful' })
  async spGRpChannelFoodRevenueSumary(
    @Query() channelOrderRevenueSumaryDto: ChannelOrderRevenueSumaryDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      channelOrderRevenueSumaryDto.report_type,
      channelOrderRevenueSumaryDto.date_string,
      channelOrderRevenueSumaryDto.from_date,
      channelOrderRevenueSumaryDto.to_date
    ).getReportTimeDatabase();


    let dataGrpc = await this.channelOrderFoodService.getChannelFoodRevenueSumaryReportGrpc(
      user.restaurant_id,
      channelOrderRevenueSumaryDto.restaurant_brand_id,
      channelOrderRevenueSumaryDto.branch_id,
      channelOrderRevenueSumaryDto.food_channel_id,
      channelOrderRevenueSumaryDto.hour_to_take_report,
      time.group_type,
      time.from_date,
      time.to_date
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(new ChannelFoodRevenueSumarOutputResponse(dataGrpc.data));
    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/branches")
  @ApiOperation({
    summary: "Lấy danh sách đơn hàng đối tác kết nối với thương hiệu",
  })
  @ApiResponse({ status: 200, description: "Successful operation" })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  @ApiQuery({
    name: "channel_order_food_id",
    required: false,
    type: Number,
    description: "Id đối tác tích hợp",
  })
  async getBranches(
    @Query("restaurant_brand_id") restaurantBrandId: number = 0,
    @Query("channel_order_food_id") channelOrderFoodId: number = -1,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.getChannelBranchesOfTokenToConnectionGrpc(
      user.restaurant_id,
      restaurantBrandId,
      -1,
      channelOrderFoodId
    )

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      response.setData([]);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc?.data ?? []);

    return res.status(HttpStatus.OK).send(response);
  }

  @Post("/sync-branches")
  @ApiOperation({
    summary: "Lấy danh sách đơn hàng đối tác kết nối với thương hiệu",
  })
  @ApiResponse({ status: 200, description: "Successful operation" })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  @ApiQuery({
    name: "channel_order_food_id",
    required: false,
    type: Number,
    description: "Id đối tác tích hợp",
  })
  async syncBranches(
    @Body() syncChannelBranchDTO: SyncChannelBranchDTO,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.syncChannelBranchesOfTokenToConnectionGrpc(
      user.restaurant_id,
      syncChannelBranchDTO.restaurant_brand_id,
      syncChannelBranchDTO.channel_order_food_id
    )       

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      response.setData([]);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc?.data ?? []);

    return res.status(HttpStatus.OK).send(response);
  }

  @GrpcMethod("FoodChannelSettingService", "updateSettingFoodChannelBranch")
  async updateSettingFoodChannelBranch(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      branch_id: number,
      quantity_slot_SHF: number,
      quantity_slot_GRF: number,
      quantity_slot_BEF: number,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.updateSettingFoodChannelBranchGrpc(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.branch_id,
      data.quantity_slot_SHF,
      data.quantity_slot_GRF,
      data.quantity_slot_BEF
    )

    if (result.status != HttpStatus.OK) {
      response.setStatus(result.status);
      response.setMessageError(result.message);
    }
    return response;
  }


  @GrpcMethod("FoodChannelSettingService", "updateSettingFoodChannelRestaurantBrand")
  async updateSettingFoodChannelRestaurantBrand(
    data: {
      restaurant_id: number,
      restaurant_brand_id: number,
      quantity_account_SHF: number,
      quantity_account_GRF: number,
      quantity_account_BEF: number,
    }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    let result = await this.channelOrderFoodService.updateSettingFoodChannelRestaurantBrandGrpc(
      data.restaurant_id,
      data.restaurant_brand_id,
      data.quantity_account_SHF,
      data.quantity_account_GRF,
      data.quantity_account_BEF
    )

    if (result.status != HttpStatus.OK) {
      response.setStatus(result.status);
      response.setMessageError(result.message);
    }
    return response;
  }


  @Post("/order/confirm/:id")
  async confirmOrder(
    @Param('id') id: number,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.comfirmChannelOrderGrpc(
      user.restaurant_id,
      id
    )
    
    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      response.setData([]);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc?.data ?? []);

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/reset-to-test")
  @ApiOperation({ summary: "Lấy danh sách đối tác kết nối với thương hiệu" })
  @ApiResponse({ status: 200, description: "Successful operation" })
  @ApiQuery({
    name: "restaurant_id",
    required: true,
    type: Number,
    description: "Id nhà hàng",
  })
  @ApiQuery({
    name: "restaurant_brand_id",
    required: true,
    type: Number,
    description: "Id thương hiệu",
  })
  @ApiQuery({
    name: "channel_order_food_id",
    required: false,
    type: Number,
    description: "Id đối tác tích hợp",
  })
  
  async reset(
    @Query("restaurant_brand_id") restaurant_brand_id: number = 0,
    @Query("channel_order_food_id") channel_order_food_id: number = -1,
    @Query("restaurant_id") restaurant_id: number = 0,
    @Query("branch_id") branch_id: number = -1,
    @Res() res: Response
  ): Promise<any> {    

    let response: ResponseData = new ResponseData();

    const data = await this.channelOrderFoodService.resetChannelOrderGrpc(
      restaurant_id,
      restaurant_brand_id,
      branch_id,
      channel_order_food_id,
    );

    if (data.status != HttpStatus.OK) {
      response.setStatus(data.status);
      response.setMessageError(data.message);
      return res.status(HttpStatus.OK).send(response);
    }
    
    return res.status(HttpStatus.OK).send(response);
  }


  @Get("/report/channel-food")
  @ApiOperation({ summary: "Báo cáo món ăn app food" })
  @ApiResponse({ status: 200, description: 'Successful' })
  async spGRpChannelFood(
    @Query() channelFoodReportDto: ChannelFoodReportDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      channelFoodReportDto.report_type,
      channelFoodReportDto.date_string,
      channelFoodReportDto.from_date,
      channelFoodReportDto.to_date
    ).getReportTimeDatabase();

    const pagi = new Pagination(channelFoodReportDto.page , channelFoodReportDto.limit);

    let dataGrpc = await this.channelOrderFoodService.getChannelFoodReportGrpc(
      user.restaurant_id,
      channelFoodReportDto.restaurant_brand_id,
      channelFoodReportDto.branch_id,
      channelFoodReportDto.hour_to_take_report,
      time.from_date,
      time.to_date,
      channelFoodReportDto.keySearch,
      pagi.getLimit(),
      pagi.getOffset()
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    if(!dataGrpc.data.list){
      dataGrpc.data.list = [];
    }

    response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }



//   @Post("/order/confirm-orders")
//   async confirmOrders(
//     @Body() confirmOrdersDto: ConfirmOrdersDto,
//     @GetUser() user: UserValidateToken,
//     @Res() res: Response
//   ): Promise<any> {
//     let response: ResponseData = new ResponseData();

//     // let dataGrpc = await this.channelOrderFoodService.comfirmChannelOrderGrpc(
//     //   user.restaurant_id,
//     //   id
//     // )
    
//     if (dataGrpc.status != HttpStatus.OK) {
//       response.setStatus(dataGrpc.status);
//       response.setMessageError(dataGrpc.message);
//       response.setData([]);
//       return res.status(HttpStatus.OK).send(response);
//     }

//     response.setData(dataGrpc?.data ?? []);

//     return res.status(HttpStatus.OK).send(response);
//   }

  @Get("/report/sumary-data")
  @ApiOperation({ summary: "Báo cáo tổng quan dữ liệu của food channel" })
  @ApiResponse({ status: 200, description: 'Successful' , type : ChannelFoodSumaryDataResponse })
  async spGRpChannelFoodSumaryData(
    @Query() channelOrderRevenueSumaryDto: ChannelOrderRevenueSumaryDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      channelOrderRevenueSumaryDto.report_type,
      channelOrderRevenueSumaryDto.date_string,
      channelOrderRevenueSumaryDto.from_date,
      channelOrderRevenueSumaryDto.to_date
    ).getReportTimeDatabase();


    let dataGrpc = await this.channelOrderFoodService.getChannelFoodSumaryDataReportGrpc(
      user.restaurant_id,
      channelOrderRevenueSumaryDto.restaurant_brand_id,
      channelOrderRevenueSumaryDto.branch_id,
      channelOrderRevenueSumaryDto.food_channel_id,
      channelOrderRevenueSumaryDto.hour_to_take_report,
      time.group_type,
      time.from_date,
      time.to_date
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(new ChannelFoodSumaryDataResponse(dataGrpc.data));
    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/report/channel-orders")
  @ApiOperation({ summary: "Báo cáo đơn hàng app food" })
  @ApiResponse({ status: 200, description: 'Successful' })
  async spGRpChannelOrders(
    @Query() channelFoodReportDto: ChannelFoodOrderReportDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      channelFoodReportDto.report_type,
      channelFoodReportDto.date_string,
      channelFoodReportDto.from_date,
      channelFoodReportDto.to_date
    ).getReportTimeDatabase();

    const pagi = new Pagination(channelFoodReportDto.page , channelFoodReportDto.limit);

    let dataGrpc = await this.channelOrderFoodService.getChannelFoodOrderReportGrpc(
      user.restaurant_id,
      channelFoodReportDto.restaurant_brand_id,
      channelFoodReportDto.branch_id,
      channelFoodReportDto.channel_order_food_id,
      channelFoodReportDto.hour_to_take_report,
      time.from_date,
      time.to_date,
      channelFoodReportDto.key_search,
      pagi.getOffset(),
      pagi.getLimit(),
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    if(!dataGrpc.data.list){
      dataGrpc.data.list = [];
    }    

    response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/report/earning-summary")
  @ApiOperation({ summary: "Báo cáo tổng quan doanh thu của grab" })
  @ApiResponse({ status: 200, description: 'Successful' , type : ChannelFoodEarningSumaryReportResponse})
  async getEarningSummaryReport(
    @Query() dto: ChannelFoodEarningSuamryReportDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.getEarningSumaryReportGrpc(
      user.restaurant_id,
      dto.restaurant_brand_id,
      dto.branch_id,
      dto.channel_branch_id,
      UtilsDate.formatDateInsertDatabase(dto.from_date),
      UtilsDate.formatDateInsertDatabase(dto.to_date),
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Post("/orders/handle-complete/:id")
  @ApiOperation({ summary: "Xử lý trạng thái hoàn tất của đơn hàng treo " })
  @ApiResponse({ status: 200, description: 'Successful'})
  async updateOrderHandleComplete(
    @Param('id') id: number,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.handleCompleteChannelOrderGrpc(
      user.restaurant_id,
      id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    // response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }


  @Post("/orders/handle-complete-v2")
  @ApiOperation({ summary: "Xử lý trạng thái hoàn tất của đơn hàng treo " })
  @ApiResponse({ status: 200, description: 'Successful'})
  async updateOrderHandleCompleteV2(
    @Body() dto : HandleStatusChannelOrderDTO,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();
    
    let dataGrpc = await this.channelOrderFoodService.handleCompleteChannelOrderV2Grpc(
      user.restaurant_id,
      dto.id,
      dto.restaurant_order_id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    // response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }


  @Post("/orders/handle-cancel/:id")
  @ApiOperation({ summary: "Xử lý trạng thái huỷ của đơn hàng treo " })
  @ApiResponse({ status: 200, description: 'Successful'})
  async updateOrderHandleCancel(
    @Param('id') id: number,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.handleCancelChannelOrderGrpc(
      user.restaurant_id,
      id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    // response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Post("/orders/handle-cancel-v2")
  @ApiOperation({ summary: "Xử lý trạng thái huỷ của đơn hàng treo " })
  @ApiResponse({ status: 200, description: 'Successful'})
  async updateOrderHandleCancelV2(
    @Body() dto : HandleStatusChannelOrderDTO,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.handleCancelChannelOrderV2Grpc(
      user.restaurant_id,
      dto.id,
      dto.restaurant_order_id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    // response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
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

    // console.log(`Đồng bộ đơn hàng bằng grpc : ${data.restaurant_id}-${data.restaurant_brand_id}-${data.branch_id}-${data.channel_order_food_id}`);

    this.channelOrderFoodService.deleteRedisFoodChannelFoodTechresMapGrpc(
        data.restaurant_id,
        data.restaurant_brand_id,
        data.branch_id,
        data.channel_order_food_id
    );

    return response;
  }

  @Post("/orders/batch-confirm")
  @ApiOperation({ summary: "Xác nhận đơn hàng" })
  @ApiResponse({ status: 200, description: 'Successful'})
  async batchConfirmChannelOrder(
    @Body() dto : BatchConfirmChannelOrderDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.batchConfirmChannelOrderGrpc(
        user.restaurant_id,
        dto.branch_id,
        JSON.stringify(dto.ids)
      );
  
    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(JSON.parse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Post("/orders/cancel-print")
  @ApiOperation({ summary: "Api in huỷ đơn" })
  @ApiResponse({ status: 200, description: 'Successful'})
  async updateCancelPrintOrders(
    @Body() dto : BatchConfirmChannelOrderDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.updateCancelPrintOrdersGrpc(
        user.restaurant_id,
        dto.branch_id,
        JSON.stringify(dto.ids)
      );
  
    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/orders/print-order-detail/:id")
  @ApiOperation({
    summary: "In chi tiết đơn",
  })
  @ApiResponse({ status: 200, description: "Successful operation " })
  @ApiQuery({
    name: "restaurant_id",
    required: true,
    type: Number,
    description: "Id nhà hàng",
  })
  async getDetailToPrint(
    @Param("id") id: number = 0,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();
    
    let dataGrpc = await this.channelOrderFoodService.getOrderDetailToPrintGrpc(
      id,
      user.restaurant_id
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }    

    response.setData(new CustomerOrderResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }

  @Get("/report/earning-summary-v2")
  @ApiOperation({ summary: "Báo cáo tổng quan doanh thu của grab" })
  @ApiResponse({ status: 200, description: 'Successful' , type : ChannelFoodEarningSumaryReportResponse})
  async getEarningSummaryReportV2(
    @Query() dto: ChannelFoodEarningSuamryReportDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodService.getEarningSumaryReportV2Grpc(
      user.restaurant_id,
      dto.restaurant_brand_id,
      dto.branch_id,
      dto.channel_branch_id,
      UtilsDate.formatDateInsertDatabase(dto.from_date),
      UtilsDate.formatDateInsertDatabase(dto.to_date),
    );

    if (dataGrpc.status != HttpStatus.OK) {
      response.setStatus(dataGrpc.status);
      response.setMessageError(dataGrpc.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(new ChannelFoodEarningSumaryReportResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }
}


