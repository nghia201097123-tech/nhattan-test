import { InjectQueue } from "@nestjs/bull";
import { Body, Controller, HttpStatus, OnModuleInit, Param, Post, Res } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Response } from 'express';
import { Queue } from "bull";
import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { ChannelOrderService } from "./channel-order.service";

@Controller("channel-orders")
export class ChannelOrderController implements OnModuleInit {
  constructor(
    private readonly channelOrderService: ChannelOrderService,
  ) { }

  onModuleInit() {
  }

  @GrpcMethod("ChannelOrderFoodApiService", "getChannelBranches")
  async getChannelBranches(data: { restaurant_brand_id: number, tokens: string }): Promise<any> {
    let response: ResponseData = new ResponseData();

    const result = await this.channelOrderService.runGetBranches(JSON.parse(data.tokens));
    
    response.setData(result.flatMap((item) => item["branches"])); // Trả về kết quả
    
    return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "checkTokenAllFoodChannel")
  async checkTokenAllFoodChannel(data: { tokens: string }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();
    const listToken = JSON.parse(data.tokens);
    const result = await this.channelOrderService.runCheckTokensWorkers(
      listToken
    );
    response.setData(result.flatMap((item) => item.error));

    response.setStatus(HttpStatus.OK);
    response.setMessageError("Ok");
    return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "syncChannelOrderHistories")
  async syncChannelOrderHistories(data: {
    tokens: string,
    time: string
  }): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();

    // const job = await this.workerQueueSyncOrderHistory.add("processSyncChannelOrderHistory", 
    //   {
    //     tokens : JSON.parse(data.tokens),
    //     time : data.time

    //   }, { removeOnComplete: true});

    // const results = await job.finished();

    // response.setData({
    //   history_orders_SHF : JSON.stringify(results
    //     .filter((item) => item.channel_order_food_id === 1)
    //     .reduce((acc, item) => acc.concat(item.orders), [])),
    //   history_orders_GRF : JSON.stringify(results
    //     .filter((item) => item.channel_order_food_id === 2)
    //     .reduce((acc, item) => acc.concat(item.orders), [])),
    //   history_orders_BEF : JSON.stringify(results
    //     .filter((item) => item.channel_order_food_id === 4)
    //     .reduce((acc, item) => acc.concat(item.orders), []))
    // });

    response.setStatus(HttpStatus.OK);
    response.setMessageError("Ok");
    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "syncChannelOrderShf")
  async syncChannelOrderShf(data: { 
      restaurant_id: number,
      restaurant_brand_id: number, 
      branch_id: number,
      tokens: string 
  }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    
    try {
    
      await this.channelOrderService.syncChannelOrderShfV3(
       data.tokens
      )

      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      
    } catch (error) {
      
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Lõi đồng bộ đơn hàng Shoppe Food");

    }

    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "syncChannelOrderGrf")
  async syncChannelOrderGrf(data: { 
      restaurant_id: number,
      restaurant_brand_id: number, 
      branch_id: number,
      tokens: string 
  }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    
    try {            

      await this.channelOrderService.syncChannelOrderGrf(
        data.tokens
      )

      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      
    } catch (error) {
      
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Lõi đồng bộ đơn hàng Grab Food");

    }

    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "syncChannelOrderBef")
  async syncChannelOrderBef(data: { 
      restaurant_id: number,
      restaurant_brand_id: number, 
      branch_id: number,
      tokens: string 
  }): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    
    try {

      await this.channelOrderService.syncChannelOrderBef(
        data.tokens
      )

      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      
    } catch (error) {
      
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Lõi đồng bộ đơn hàng Bee Food");

    }

    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "healthCheckShf")
  async healthCheckShf(data: {}): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    response.setStatus(HttpStatus.OK);
    response.setMessageError("Ok");
  
    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "healthCheckGrf")
  async healthCheckGrf(data: {}): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    response.setStatus(HttpStatus.OK);
    response.setMessageError("Ok");
  
    return response;
  }

  @GrpcMethod("SyncConnectorChannelOrderService", "healthCheckBef")
  async healthCheckBef(data: {}): Promise<any> {

    let response: BaseResponseData = new BaseResponseData();
    response.setStatus(HttpStatus.OK);
    response.setMessageError("Ok");
  
    return response;
  }

  @Post("/add-job-queue-by-branch/:id/food-channel/:channel_order_food_id")
  async batchConfirmChannelOrderHttp(
    @Param('id') id: number,
    @Param('channel_order_food_id') channelOrderFoodId: number,
    @Res() res: Response
  ): Promise<any> {
    let response: BaseResponseData = new BaseResponseData();    

    await this.channelOrderService.addJobHandleSyncOrderByBranch(id,channelOrderFoodId);
      
    return res.status(HttpStatus.OK).send(response);
  }

}
