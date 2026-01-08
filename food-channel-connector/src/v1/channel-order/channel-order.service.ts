import { forwardRef, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Client, ClientGrpc } from "@nestjs/microservices";
import * as path from "path";
import { lastValueFrom } from "rxjs";
import { Worker } from "worker_threads";
import { grpcClientFoodChannelProcessorClientOptions } from "../grpc/client/food-channel-processor-client-options";
import {
  BaseEmptyResponse,
  ChannelOrderServiceClient,
} from "../grpc/interfaces/channel-order";
import { PiscinaService } from "../piscina/piscina.service";
import { ChannelOrderSchemaService } from "../channel-order-schema/channel-order-schema.service";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { SyncChannelOrderBefService } from "./sync-channel-order/sync-channel-order-bef";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { SyncChannelOrderShfService } from "./sync-channel-order/sync-channel-order-shf";
import { SyncChannelOrderGrfService } from "./sync-channel-order/sync-channel-order-grf";
import { RedisService } from "../redis/redis.service";
import { ChannelOrderSchema } from "../channel-order-schema/schema/channel-order.schema";
import { ChannelOrderToMongo } from "./entity/channel-order-to-mongo.entity";
import { ChannelOrderHistoryToMongo } from "./entity/channel-order-history-to-mongo.entity";
import * as pLimit from "p-limit";
import { InjectQueue } from "@nestjs/bull";
const cpuCount = require("os").cpus().length;
import { Queue } from "bull";
import { OrderRedisMapValue } from "./channel-order.dto/channel-order-redis-map";
import { UtilsBaseFunction } from "src/utils.common/utils.base-function.commom/utils.base-function.comom";

@Injectable()
export class ChannelOrderService {
  @Client(grpcClientFoodChannelProcessorClientOptions)
  private readonly grpcClientFoodChannelProcessorClientOptions: ClientGrpc;

  private channelOrderService: ChannelOrderServiceClient;

  constructor(
    private readonly piscinaService: PiscinaService,
    private readonly channelOrderSchemaService: ChannelOrderSchemaService,
    private readonly syncChannelOrderBefService: SyncChannelOrderBefService,
    private readonly syncChannelOrderShfService: SyncChannelOrderShfService,
    private readonly syncChannelOrderGrfService: SyncChannelOrderGrfService,
    @Inject(forwardRef(() => RedisService))
    private readonly redisService: RedisService, 

    @InjectQueue("queue-sync-channel-order-mongo-to-mysql")
    private readonly queueSyncChannelOrderMongoToMysql: Queue,

    @InjectQueue("queue-sync-token-expired")
    private readonly queueSyncTokenExpired: Queue,

    @InjectQueue(`${process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_SYNC_CHANNEL_ORDER}-by-branch`)
    private readonly queueSyncChannelOrderByBranch: Queue,

  ) { }

  onModuleInit() {
    this.channelOrderService =
      this.grpcClientFoodChannelProcessorClientOptions.getService<ChannelOrderServiceClient>(
        "ChannelOrderService"
      );
  }

  async syncOrdersGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    accessTokens: string,
    newOrdersSHF: string,
    newOrdersGRF: string,
    newOrdersBEF: string,
    historyOrdersSHF: string,
    historyOrdersGRF: string,
    historyOrdersBEF: string,
    customers: string
  ): Promise<BaseEmptyResponse> {
    try {
      let data = await lastValueFrom(
        this.channelOrderService.syncOrders({
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          access_tokens: accessTokens,
          new_orders_SHF: newOrdersSHF,
          new_orders_GRF: newOrdersGRF,
          new_orders_BEF: newOrdersBEF,
          history_orders_SHF: historyOrdersSHF,
          history_orders_GRF: historyOrdersGRF,
          history_orders_BEF: historyOrdersBEF,
          customers: customers,
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

  async syncOrdersMongoGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    accessTokens: string,
  ): Promise<BaseEmptyResponse> {
    try {

      let data = await lastValueFrom(
        this.channelOrderService.syncOrdersMongo({
          restaurant_id: restaurantId,
          restaurant_brand_id: restaurantBrandId,
          branch_id: branchId,
          channel_order_food_id: channelOrderFoodId,
          access_tokens: accessTokens,
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

  async runWorkers(dataArray: any[]): Promise<any> {
    let numWorkers: number = dataArray.length; // Số lượng worker muốn khởi tạo
    const workerPromises = [];

    for (let i = 0; i < numWorkers; i++) {
      const workerPromise = new Promise<string>((resolve, reject) => {
        const worker = new Worker(path.resolve(__dirname, "worker.js"), {
          workerData: { data: dataArray[i] },
        });

        worker.on("message", (message) => {
          resolve(message);
        });

        worker.on("error", (err) => {
          reject(err);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
      workerPromises.push(workerPromise);
    }
    return await Promise.all(workerPromises);
  }

  async runGetBranchWorkers(dataArray: any[]): Promise<any> {
    let numWorkers: number = dataArray.length; // Số lượng worker muốn khởi tạo
    const workerPromises = [];

    for (let i = 0; i < numWorkers; i++) {
      const workerPromise = new Promise<string>((resolve, reject) => {
        const worker = new Worker(
          path.resolve(__dirname, "get-branches-worker.js"),
          {
            workerData: { data: dataArray[i] },
          }
        );

        worker.on("message", (message) => {
          resolve(message);
        });

        worker.on("error", (err) => {
          reject(err);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
      workerPromises.push(workerPromise);
    }
    return await Promise.all(workerPromises);
  }


  async runGetBranches(listToken: any[]): Promise<any> {
    return await this.piscinaService.runGetBranchWorkersV2(listToken);
  }

  async runCheckTokensWorkers(dataArray: any[]): Promise<any> {
    let numWorkers: number = dataArray.length; // Số lượng worker muốn khởi tạo
    const workerPromises = [];

    for (let i = 0; i < numWorkers; i++) {
      const workerPromise = new Promise<string>((resolve, reject) => {
        const worker = new Worker(
          path.resolve(__dirname, "check-tokens-worker.js"),
          {
            workerData: { data: dataArray[i] },
          }
        );

        worker.on("message", (message) => {
          resolve(message);
        });

        worker.on("error", (err) => {
          reject(err);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
      workerPromises.push(workerPromise);
    }
    return await Promise.all(workerPromises);
  }

  async runUpdateOrderStatusWorkers(dataArray: any[]): Promise<any> {
    let numWorkers: number = dataArray.length; // Số lượng worker muốn khởi tạo
    const workerPromises = [];

    for (let i = 0; i < numWorkers; i++) {
      const workerPromise = new Promise<string>((resolve, reject) => {
        const worker = new Worker(
          path.resolve(__dirname, "update-order-status-worker.js"),
          {
            workerData: { data: dataArray[i] },
          }
        );

        worker.on("message", (message) => {
          resolve(message);
        });

        worker.on("error", (err) => {
          reject(err);
        });

        worker.on("exit", (code) => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
      workerPromises.push(workerPromise);
    }
    return await Promise.all(workerPromises);
  }

  // Đồng bộ đơn hàng dành cho shoppe food
  async syncChannelOrderShf(
    tokens: string
  ) {

    try {
      /**
       *
       * Bước 1: Lấy được danh sách đơn hàng bên SPF (chưa là trạng thái cuối).
       * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
       * Bước 3:
       *  Tách ra làm 2 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
       *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
       *  - Mãng 2 danh sác đơn hang chưa có trong mongo --> để tạo mới
       *
       * Bước 4:
       *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
       *  Mãng 2 phải gọi sang SPF để lấy thông tin chi tiết để cập nhật dữ liệu
       *
       *
       * Bước 5: Lấy được danh sách đơn hàng bên SPF (là trạng thái cuối).
       * Bước 6:
       *  Tách ra làm 2 mãng
       *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
       *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
       *
       *
       * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
       *  . Xử lý đơn hàng khi cột is_updated = 1
       *  . Nếu có token mới thì xử lý update token và có key redis
       *
       */

      // LƯU Ý: Nếu token không hợp lệ thì nên có cảnh báo cho người dùng còn hiện tại không có

      const dataOrders = await this.piscinaService.runSyncOrderShfWorkers(
        JSON.parse(tokens)
      );

      let isGrpc = 0;

      const listToCheckReject =  dataOrders
      .filter(item => item.status === 'rejected');

      if(listToCheckReject.length > 0 ){

        console.log('listToCheckReject',JSON.stringify(listToCheckReject));

        await this.piscinaService.destroyPiscina(ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER);
        await this.piscinaService.restartPiscina(ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER);
      }

      const branchIds: number[] = [
        ...new Set(
          dataOrders
            .filter(item => item.status === 'fulfilled')
            .map(item => Number(item.value.branch_id)) as number[]
        ),
      ];

      const listOrderNew = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.new_datas);
      // nếu có đơn mới thì sẽ xử lý 
      if (listOrderNew && listOrderNew.length > 0) {

        let listChannelOrderMongoIds = await new Set(
          (
            await this.channelOrderSchemaService.getOrderNewsToCheckV2(
              branchIds,
              ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              listOrderNew.map((order) => `${order.order_id}`)
            )
          ).map((order) => `${order.order_id}${order.branch_id}`)
        );

        const ordersToUpdate = listOrderNew.filter((order) =>
          listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );

        let ordersToCreate = listOrderNew.filter(
          (order) => !listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );

        // danh sách đơn hàng thêm mới khác rộng thì phải gọi api chi tiết đơn hàng để bổ sung đầy đủ thông tin
        if (ordersToCreate.length > 0) {
          for (const order of ordersToCreate) {
            let dataDetail: any = await this.syncChannelOrderShfService.getOrderDetail(
              order.url_detail ?? ChannelOrderFoodApiEnum.SHF_GET_BILL_DETAIL,
              order.access_token,
              order.order_id,
              order.order_code,
              order.channel_branch_id,
              order.x_sap_ri
            );

            if (dataDetail.status == HttpStatus.OK) {
              order.customer_name = dataDetail.data.customer_name;
              order.customer_phone = this.formatPhoneNumber(dataDetail.data.customer_phone);
              order.delivery_address = dataDetail.data.customer_address;
              order.driver_phone = this.formatPhoneNumber(order.driver_phone);
            }
          }

          await this.channelOrderSchemaService.createMany(
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              // restaurant_id,
              // restaurant_brand_id,
              // branch_id,
              ordersToCreate.filter((order) => order.details !== "[]"),
              +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
            )
          );

          isGrpc = 1;
        }

        if (ordersToUpdate.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
            ordersToUpdate
          );

          isGrpc = 1;

        }
      }

      const listOrderOld = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.history_datas);

      if (listOrderOld && listOrderOld.length > 0) {

        const listChannelOrderMongoOldIds = await new Set(
          (
            await this.channelOrderSchemaService.getOrderHistoriesToCheckV2(
              // restaurant_id,
              // restaurant_brand_id,
              branchIds,
              ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              listOrderOld.map((order) => `${order.order_id}`)
            )
          ).map((order) => `${order.order_id}${order.branch_id}`)
        );

        const ordersOldToUpdate = listOrderOld.filter((order) =>
          listChannelOrderMongoOldIds.has(`${order.order_branch_check}`)
        );

        if (ordersOldToUpdate.length > 0) {          

          await this.channelOrderSchemaService.updateOrderHistoriesV2(
            // restaurant_id,
            // restaurant_brand_id,
            // branch_id,
            ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
            ordersOldToUpdate
          );

          isGrpc = 1;
        }
      }

      if (isGrpc == 1) {

        for (const bId of branchIds) {

          if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER}-${bId}`)) {              

            this.syncOrdersMongoGrpc(
              0,
              0,
              bId,
              ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              JSON.stringify(
                dataOrders
                  .filter(item => item.status === 'fulfilled' && item.value.access_token && bId == item.value.branch_id)
                  .map(item => ({
                    access_token: item.value.access_token,
                    channel_order_food_token_id: item.value.channel_order_food_token_id
                  }))
              ),
            );
          }
        }
      }else{

        const tokens =  dataOrders.filter(item => item.status === 'fulfilled' && item.value.access_token)
                                  .map(item => ({
                                    branch_id : item.value.branch_id,
                                    access_token: item.value.access_token,
                                    channel_order_food_token_id: item.value.channel_order_food_token_id
                                  }))

        for(const token of tokens){

          if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER}-${token.branch_id}`)) {              

            this.syncOrdersMongoGrpc(
              0,
              0,
              token.branch_id,
              ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              JSON.stringify(token),
            );
          }
        }

      }

      // console.log(`Gửi grpc để đồng bộ đơn hàng - ${branchIds.join('-')} - ${ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER}`);


    } catch (error) {

      console.log(error);

    }
  }

  async syncChannelOrderGrf(
    tokens: string
  ) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {         

      const dataOrders = await this.piscinaService.runSyncOrderGrfWorkers(JSON.parse(tokens));


      // console.log(await this.piscinaService.getInfor());
      
      // Sử dụng JSON.stringify thay cho util.inspect để tránh lỗi không tìm thấy 'util'
      // console.log(JSON.stringify(dataOrders.map(x => ({
      //   status : x.status,
      //   channel_order_food_token_id : x.channel_order_food_token_id
      // })), null, 2));

      const listToCheckReject =  dataOrders
      .filter(item => item.status === 'rejected');

      if(listToCheckReject.length > 0 ){     
        
        // console.log('listToCheckReject',JSON.stringify(listToCheckReject));

        await this.piscinaService.destroyPiscina(ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER);
        await this.piscinaService.restartPiscina(ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER);
      }

      const listOrderNew = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.new_datas);

      let isGrpc = 0;

      const branchIds: number[] = [
        ...new Set(
          dataOrders
            .filter(item => item.status === 'fulfilled')
            .map(item => Number(item.value.branch_id)) as number[]
        ),
      ];

      if (listOrderNew && listOrderNew.length > 0) {

        let listChannelOrderMongo = await this.channelOrderSchemaService.getOrderNewsToCheckV2(
          branchIds,
          ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
          listOrderNew.map((order) => `${order.order_id}`)
        );

        // Lấy danh sách ids đơn hàng trong Mongo trong ngày hôm nay
        const listChannelOrderMongoIds = await new Set(
          listChannelOrderMongo.map((order) => `${order.order_id}${order.branch_id}${order.display_id}`)
        );

        // Lấy danh sách ids đơn hàng trong Mongo trong ngày hôm nay không có tài xế
        const listChannelOrderMongoNotDriverIds = new Set(
          listChannelOrderMongo
            .filter((order) => order.driver_name === "")
            .map((order) => `${order.order_id}${order.branch_id}${order.display_id}`)
        );

        // Lọc lấy danh sách đơn hàng đã lưu trong mongo
        const ordersToUpdate = listOrderNew.filter((order) =>
          listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );

        // Lọc lấy danh sách đơn hàng chưa có thông tin tài xế
        let ordersToUpdateDriver = ordersToUpdate.filter((order) =>
          listChannelOrderMongoNotDriverIds.has(`${order.order_branch_check}`)
        );

        // Lọc lấy danh sách đơn hàng chưa được tạo dứoi mongo
        let ordersToCreate = listOrderNew.filter(
          (order) => !listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );
        
        // danh sách đơn hàng thêm mới phải gọi api chi tiết đơn hàng để bổ sung đầy đủ thông tin
        if (ordersToCreate.length > 0) {

          for (const order of ordersToCreate) {
            
            let dataDetail = await this.syncChannelOrderGrfService.getOrderDetail(
              order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
              order.access_token,
              order.order_id,
              order.display_id
            );

            if (dataDetail.status == HttpStatus.OK) {
              order.customer_order_amount = dataDetail.data.customer_order_amount;
              order.customer_discount_amount =
                dataDetail.data.customer_discount_amount;
              order.customer_name = dataDetail.data.customer_name;
              order.customer_phone = this.formatPhoneNumber(dataDetail.data.customer_phone);
              order.delivery_address = dataDetail.data.customer_address;
              order.driver_phone = this.formatPhoneNumber(dataDetail.data.driver_phone);
              order.driver_name = dataDetail.data.driver_name;
              order.delivery_amount = dataDetail.data.delivery_amount;
              order.small_order_amount = dataDetail.data.small_order_amount;
              order.details = JSON.stringify(dataDetail.data.item_infos);
              order.note = dataDetail.data.note;
              order.item_discount_amount = dataDetail.data.item_discount_amount;
              order.discount_amount = dataDetail.data.discount_amount;
            }            
          }          

          await this.channelOrderSchemaService.createMany(
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersToCreate.filter((order) => order.details !== "[]"),
              +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
            )
          );

          isGrpc = 1;
        }

        // Cập nhập đơn hàng mới đã có tài xế
        if (ordersToUpdate.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsForGrabFoodV2(
            ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
            ordersToUpdate.filter(
              (order) => !listChannelOrderMongoNotDriverIds.has(`${order.order_branch_check}`)
            )
          );
          isGrpc = 1;
        }

        // Cập nhập đơn hàng chưa có tài xế
        if (ordersToUpdateDriver.length > 0) {
          for (const order of ordersToUpdateDriver) {
            let dataDetail = await this.syncChannelOrderGrfService.getDriverInfo(
              order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
              order.access_token,
              order.order_id,
              order.display_id
            );

            if (dataDetail.status == HttpStatus.OK) {
              order.driver_phone = dataDetail.data.driver_phone;
              order.driver_name = dataDetail.data.driver_name;
              order.status_string = dataDetail.data.status_string;
            }
          }

          await this.channelOrderSchemaService.updateOrdersGrabV2(
            ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
            ordersToUpdateDriver.filter(
              (order) => order.driver_phone !== "" && order.driver_name !== ""
            )
          );

          isGrpc = 1;
        }
      }

      const listOrderOld = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.history_datas);        

      if (listOrderOld && listOrderOld.length > 0) {

        const listChannelOrderMongoOlds = await this.channelOrderSchemaService.getOrderHistoriesToCheckV2(
          // restaurant_id,
          // restaurant_brand_id,
          branchIds,
          ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
          listOrderOld.map((order) => `${order.order_id}`)
        );

        const listChannelOrderMongoOldIds = await new Set(
          listChannelOrderMongoOlds.map((order) => `${order.order_id}${order.branch_id}${order.display_id}`)
        );        

        const listChannelOrderMongoNotDriverIds = new Set(
          listChannelOrderMongoOlds
            .filter((order) => order.driver_name === "")
            .map((order) => `${order.order_id}${order.branch_id}${order.display_id}`)
        );

        // Lọc lấy danh sách đơn hàng đã lưu trước đó
        const ordersOldToUpdate = listOrderOld.filter((order) =>
          listChannelOrderMongoOldIds.has(`${order.order_branch_check}`)
        );        
        // Lọc lấy danh sách đơn hàng chưa có tài xế
        const ordersOldNotDriverToUpdate = ordersOldToUpdate.filter((order) =>
          listChannelOrderMongoNotDriverIds.has(`${order.order_branch_check}`)
        );

        // Cập đơn cũ đã có tài xế
        if (ordersOldToUpdate.length > 0) {
          await this.channelOrderSchemaService.updateOrderHistoryForGrabFoodV2(
            ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
            ordersOldToUpdate.filter(
              (order) => !listChannelOrderMongoNotDriverIds.has(`${order.order_branch_check}`)
            )
          );

          isGrpc = 1;
        }

        // Cập đơn cũ đã chưa có tài xế
        if (ordersOldNotDriverToUpdate.length > 0) {
          for (const order of ordersOldNotDriverToUpdate) {
            let dataDetail = await this.syncChannelOrderGrfService.getDriverInfo(
              order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
              order.access_token,
              order.order_id,
              order.display_id
            );
            if (dataDetail.status == HttpStatus.OK) {
              order.driver_phone = this.formatPhoneNumber(dataDetail.data.driver_phone);
              order.driver_name = dataDetail.data.driver_name;
              order.status_string = dataDetail.data.status_string;
            }
          }

          await this.channelOrderSchemaService.updateOrdersGrabV2(
            ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
            ordersOldNotDriverToUpdate
          );

          isGrpc = 1;
        }
      }    
 
      if (isGrpc == 1) {

        for (const bId of branchIds) {

          if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER}-${bId}`)) {              

              this.syncOrdersMongoGrpc(
                0,
                0,
                bId,
                ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
                JSON.stringify(
                  dataOrders
                    .filter(item => item.status === 'fulfilled' && item.value.access_token && bId == item.value.branch_id)
                    .map(item => ({
                      access_token: item.value.access_token,
                      channel_order_food_token_id: item.value.channel_order_food_token_id
                    }))
                ),
              );
            }
          }
        // console.log(`Gửi grpc để đồng bộ đơn hàng - ${branchIds.join('-')} -${ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER}`);
      }else{

        const tokens =  dataOrders.filter(item => item.status === 'fulfilled' && item.value.access_token)
                                  .map(item => ({
                                    branch_id : item.value.branch_id,
                                    access_token: item.value.access_token,
                                    channel_order_food_token_id: item.value.channel_order_food_token_id
                                  }))        

        for(const token of tokens){

          if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER}-${token.branch_id}`)) {

            this.syncOrdersMongoGrpc(
              0,
              0,
              token.branch_id,
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              JSON.stringify(token),
            );
          } 
        }

      }   
      
    } catch (error) {

      console.log(error);

    }

  }

  async syncChannelOrderBef(
    tokens: string
  ) {

    try {      

      const dataOrders = await this.piscinaService.runSyncOrderBefWorkers(
        JSON.parse(tokens)
      );

      let isGrpc = 0;

      const listToCheckReject =  dataOrders
      .filter(item => item.status === 'rejected');

      if(listToCheckReject.length > 0 ){

        console.log('listToCheckReject',JSON.stringify(listToCheckReject));
                
        await this.piscinaService.destroyPiscina(ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER);
        await this.piscinaService.restartPiscina(ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER);
      }

      const branchIds: number[] = [
        ...new Set(
          dataOrders
            .filter(item => item.status === 'fulfilled')
            .map(item => Number(item.value.branch_id)) as number[]
        ),
      ];
      
      const listOrderNew = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.new_datas);          

      if (listOrderNew && listOrderNew.length > 0) {

        let listChannelOrderMongoIds = await new Set(
          (
            await this.channelOrderSchemaService.getOrderNewsToCheckV2(
              // restaurant_id,
              // restaurant_brand_id,
              branchIds,
              ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              listOrderNew.map((order) => `${order.order_id}`)
            )
          ).map((order) => `${order.order_id}${order.branch_id}`)
        );

        // Lọc lấy đơn mới đã có ở mongo
        const ordersToUpdate = listOrderNew.filter((order) =>
          listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );

        let ordersToCreate = listOrderNew.filter(
          (order) => !listChannelOrderMongoIds.has(`${order.order_branch_check}`)
        );

        // danh sách đơn hàng thêm mới khác rộng thì phải gọi api chi tiết đơn hàng để bổ sung đầy đủ thông tin
        if (ordersToCreate.length > 0) {
          for (const order of ordersToCreate) {
            let dataDetail = await this.syncChannelOrderBefService.getOrderDetail(
              order.url_detail ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_DETAIL,
              order.access_token,
              order.order_id,
              order.channel_branch_id,
              order.merchant_id
            );

            if (dataDetail.status == HttpStatus.OK) {
              order.discount_amount = dataDetail.data.discount_amount;
              order.total_amount = dataDetail.data.total_amount;
              order.customer_order_amount = dataDetail.data.customer_order_amount;
              order.customer_discount_amount =
                dataDetail.data.customer_discount_amount;
              order.delivery_address = dataDetail.data.customer_address;
              order.customer_name = dataDetail.data.customer_name;
              order.customer_phone = this.formatPhoneNumber(dataDetail.data.customer_phone);
              order.details = JSON.stringify(dataDetail.data.foods);
              order.note = dataDetail.data.note;
              order.item_discount_amount = dataDetail.data.item_discount_amount;
              order.driver_phone = this.formatPhoneNumber(order.driver_phone);
            }
          }

          await this.channelOrderSchemaService.createMany(
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              // restaurant_id,
              // restaurant_brand_id,
              // branch_id,
              ordersToCreate.filter((order) => order.details !== "[]"),
              +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
            )
          );

          isGrpc = 1;
        }

        if (ordersToUpdate.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            // restaurant_id,
            // restaurant_brand_id,
            // branch_id,
            ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
            ordersToUpdate
          );

          isGrpc = 1;
        }
      }

      const listOrderOld = dataOrders
        .filter(item => item.status === 'fulfilled') // Lọc chỉ các object có status là 'fulfilled'
        .flatMap(item => item.value.history_datas);

      if (listOrderOld && listOrderOld.length > 0) {

        const listChannelOrderMongoOldIds = await new Set(
          (
            await this.channelOrderSchemaService.getOrderHistoriesToCheckV2(
              // restaurant_id,
              // restaurant_brand_id,
              branchIds,
              ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              listOrderOld.map((order) => `${order.order_id}`)
            )
          ).map((order) => `${order.order_id}${order.branch_id}`)
        );

        const ordersOldToUpdate = listOrderOld.filter((order) =>
          listChannelOrderMongoOldIds.has(`${order.order_branch_check}`)
        );

        if (ordersOldToUpdate.length > 0) {
         await this.channelOrderSchemaService.updateOrderHistoriesV2(
            ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
            ordersOldToUpdate
          );

          isGrpc = 1;
        }
      }

      if (isGrpc == 1) {

        for (const bId of branchIds) {

            if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER}-${bId}`)) {              

            this.syncOrdersMongoGrpc(
              0,
              0,
              bId,
              ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              JSON.stringify(
                dataOrders
                  .filter(item => item.status === 'fulfilled' && item.value.access_token && bId == item.value.branch_id)
                  .map(item => ({
                    access_token: item.value.access_token,
                    channel_order_food_token_id: item.value.channel_order_food_token_id
                  }))
              ),
            );
          }
        }
        // console.log(`Gửi grpc để đồng bộ đơn hàng - ${branchIds.join('-')} -${ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER}`);

      }else{

        const tokens =  dataOrders.filter(item => item.status === 'fulfilled' && item.value.access_token)
                                  .map(item => ({
                                    branch_id : item.value.branch_id,
                                    access_token: item.value.access_token,
                                    channel_order_food_token_id: item.value.channel_order_food_token_id
                                  }))        

        for(const token of tokens){

          if (await this.checkToSpamGrpc(`${ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER}-${token.branch_id}`)) {              

            this.syncOrdersMongoGrpc(
              0,
              0,
              token.branch_id,
              ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              JSON.stringify(token),
            );
          }
        }
      }   
    } catch (error) {
      console.log(error);

    }
  }

  async refreshStatusChannelOrder(
    branchId: number,
    channelOrderFoodId: number,
    channelOrders: string
  ) {
    const data = await this.piscinaService.runSyncOrderStatusWorkers(JSON.parse(channelOrders));

    const dataUpdateOrders = data.flatMap((item) => item.orders);

    const dataOrders = await this.channelOrderSchemaService.getOrderRefreshToCheck(
      branchId, 
      channelOrderFoodId, 
      dataUpdateOrders.flatMap((item) => `${item.channel_order_id}`)
    );
    
    if(channelOrderFoodId == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER){      

      const dataOrderIds = new Set(dataOrders.map((x) => `${x.order_id}${x.display_id}`));

      await this.channelOrderSchemaService.refreshStatusChannelOrdersGrab(
        branchId, 
        channelOrderFoodId, 
        dataUpdateOrders.filter(x => dataOrderIds.has(`${x.channel_order_id}${x.display_id}`))
      );

      await this.channelOrderSchemaService.createMany(
        await this.channelOrderSchemaService.convertToChannelOrderRefreshSchemas(branchId, 
          channelOrderFoodId, dataUpdateOrders.filter(x => !dataOrderIds.has(`${x.channel_order_id}${x.display_id}`)))
      )

    }else{
      const dataOrderIds = new Set(dataOrders.map((x) => `${x.order_id}`));
      
      await this.channelOrderSchemaService.refreshStatusChannelOrders(
        branchId, 
        channelOrderFoodId, 
        dataUpdateOrders.filter(x => dataOrderIds.has(`${x.channel_order_id}`))
      );

      await this.channelOrderSchemaService.createMany(
        await this.channelOrderSchemaService.convertToChannelOrderRefreshSchemas(branchId, 
          channelOrderFoodId, dataUpdateOrders.filter(x => !dataOrderIds.has(`${x.channel_order_id}`)))
      )
    }

  
    // console.log(`Đã xử lý task job.data.branch_id: ${branchId}, job.data.channel_order_food_id: ${channelOrderFoodId}`);
  }

  formatPhoneNumber(phone: string): string {
    // Bỏ tất cả khoảng trắng trước
    phone = phone.replace(/\s+/g, "");
  
    // Nếu số điện thoại bắt đầu bằng "+84", thay thế "+84" bằng "0"
    if (phone.startsWith("+84")) {
      return phone.replace("+84", "0");
    }
  
    // Nếu số điện thoại bắt đầu bằng "84" (không có dấu "+"), thay thế "84" bằng "0"
    if (phone.startsWith("84")) {
      return phone.replace("84", "0");
    }
  
    return phone; // Trả về số không thay đổi nếu không có "84" hoặc "+84"
  }

  async checkToSpamGrpc(key : string): Promise<boolean> {
    
    const isLock = await this.redisService.setKeyTolock(`food-channel-connector:check-spam-grpc-${key}`, "1", 1);    

    return isLock ? true : false; 
  }


  // ---------------------------------------- v2 ------------------------------------

  async syncChannelOrderGrfV2(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {
      // Khi báo biến

      let listChannelOrderMongo: ChannelOrderSchema[] = [];
      let listChannelOrderMongoOlds: ChannelOrderSchema[] = [];
      let listToCheckReject: any[] = [];
      let listOrderNew: ChannelOrderToMongo[] = [];
      let listOrderOld: ChannelOrderHistoryToMongo[] = [];
      let branchIds: number[] = [];
      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      let listOrderStringIds: string[] = [];
      let tokensToUpdate : any[] = []; 
      // Danh sách đơn cũ và đơn mới bên merchant
      const dataOrders = await this.piscinaService.runSyncOrderGrfWorkers(
        JSON.parse(tokens)
      );

      // Lấy danh sách đơn mới và đơn cũ bên merchant
      for (const item of dataOrders) {
        if (item.status === "rejected") listToCheckReject.push(item);
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.new_datas) listOrderNew.push(...item.value.new_datas);
          if (item.value.history_datas)
            listOrderOld.push(...item.value.history_datas);
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }

      // Chỉ cần 1 worker báo lỗi thì phải restart lại worker
      if (listToCheckReject.length > 0) {
        await this.piscinaService.destroyPiscina(
          ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
        );
        await this.piscinaService.restartPiscina(
          ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
        );
      }

      listOrderStringIds = listOrderNew.map((order) => `${order.order_id}`).concat(listOrderOld.map((order) => `${order.order_id}`))

      listChannelOrderMongo =
        await this.channelOrderSchemaService.getOrderNewsToCheckV2(
          branchIds,
          ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
          listOrderStringIds
        );
      
      listChannelOrderMongoOlds = listChannelOrderMongo.filter(
        (order) => order.is_grpc_complete === 0
      );

      const [newProcessResult, oldProcessResult] = await Promise.all([
        this.processGrfNewOrders(listOrderNew, listChannelOrderMongo, limit),
        this.processGrfOldOrders(listOrderOld, listChannelOrderMongoOlds , limit),
      ]);

      branchIds = Array.from(new Set<number>([...oldProcessResult ?? new Set<number>, ...newProcessResult ?? new Set<number>]));      

      if(branchIds.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncMongoToMysql(bId);
        }
      }

      if(tokensToUpdate.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async processGrfNewOrders(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Set<number>> {
    let branchIdsToAddJob: Set<number> = new Set();

    if (!listOrderNew?.length) return branchIdsToAddJob;

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToUpdateDriver: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];
    const listChannelOrderMongoNotDriverIds = new Set();
   
    const mongoMap = new Map<string,{ status_string: string; driver_name: string }>();
    // Tạo map nhanh từ Mongo
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}${order.branch_id}${order.display_id}`, {
        status_string: order.status_string ?? "",
        driver_name: order.driver_name ?? "",
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_branch_check}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);
        branchIdsToAddJob.add(order.branch_id);

      } else {
        const statusChanged = order.status_string !== mongoInfo.status_string;
        if (statusChanged && mongoInfo.driver_name) {
          ordersToUpdate.push(order);
          branchIdsToAddJob.add(order.branch_id);

        }

        if (!mongoInfo.driver_name || mongoInfo.driver_name.trim() === "") {
          ordersToUpdateDriver.push(order);
          branchIdsToAddJob.add(order.branch_id);
        }
      }    
    }

    const tasks = [
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
    
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const dataDetail =
                await this.syncChannelOrderGrfService.getOrderDetail(
                  order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                  order.access_token,
                  order.order_id,
                  order.display_id
                );
    
              if (dataDetail.status === HttpStatus.OK) {
                Object.assign(order, {
                  customer_order_amount: dataDetail.data.customer_order_amount,
                  customer_discount_amount: dataDetail.data.customer_discount_amount,
                  customer_name: dataDetail.data.customer_name,
                  customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                  delivery_address: dataDetail.data.customer_address,
                  driver_phone: this.formatPhoneNumber(dataDetail.data.driver_phone),
                  driver_name: dataDetail.data.driver_name,
                  delivery_amount: dataDetail.data.delivery_amount,
                  small_order_amount: dataDetail.data.small_order_amount,
                  details: JSON.stringify(dataDetail.data.item_infos),
                  note: dataDetail.data.note,
                  item_discount_amount: dataDetail.data.item_discount_amount,
                  discount_amount: dataDetail.data.discount_amount,
                });
    
                ordersWithDetail.push(order);
                branchIdsToAddJob.add(order.branch_id);
              }
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);
        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng mới đã có tài xế
      (async () => {
        if (ordersToUpdate?.length > 0) {
          const filtered = ordersToUpdate.filter(
            (order) =>
              !listChannelOrderMongoNotDriverIds.has(`${order.order_branch_check}`)
          );
          if (filtered.length > 0) {
            await this.channelOrderSchemaService.updateOrderNewsForGrabFoodV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              filtered
            );
          }
        }
      })(),
    
      // 3️⃣ Nhóm cập nhật đơn có tài xế (driver info)
      (async () => {
        if (ordersToUpdateDriver?.length > 0) {
          const ordersWithDetail: any[] = [];
    
          await Promise.allSettled(
            ordersToUpdateDriver.map((order) =>
              limit(async () => {
                const dataDetail =
                  await this.syncChannelOrderGrfService.getDriverInfo(
                    order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                    order.access_token,
                    order.order_id,
                    order.display_id
                  );
    
                if (dataDetail.status === HttpStatus.OK) {
                  Object.assign(order, {
                    driver_phone: dataDetail.data.driver_phone,
                    driver_name: dataDetail.data.driver_name,
                    status_string: dataDetail.data.status_string,
                  });
    
                  ordersWithDetail.push(order);
                  branchIdsToAddJob.add(order.branch_id);
                }
              })
            )
          );
    
          const valid = ordersWithDetail.filter(
            (order) => order.driver_phone !== "" && order.driver_name !== ""
          );
    
          if (valid.length > 0) {
            await this.channelOrderSchemaService.updateOrdersGrabV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              valid
            );
          }
        }
      })(),
    ];
    
    await Promise.allSettled(tasks);
    
    return branchIdsToAddJob;
  }

  async processGrfOldOrders(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Set<number>> {

    let branchIdsToAddJob: Set<number> = new Set();
    let ordersOldNotDriverToUpdate : ChannelOrderHistoryToMongo[] = [];
    let ordersOldToUpdateStatus : ChannelOrderHistoryToMongo[] = [];

    if (listOrderOld && listOrderOld?.length > 0) {

      const mongoMap = new Map(
        listChannelOrderMongoOlds.map(order => [
          `${order.order_id}${order.branch_id}${order.display_id}`,
          {
            status_string: order.status_string ?? "",
            driver_name: order.driver_name ?? "",
          },
        ])
      );
      
      listOrderOld.forEach(order => {
        const mongoInfo = mongoMap.get(`${order.order_branch_check}`);
        if (!mongoInfo) return;
      
        const statusChanged = order.status_string !== mongoInfo.status_string;
      
        if (statusChanged && mongoInfo.driver_name) {
          branchIdsToAddJob.add(order.branch_id);
          ordersOldToUpdateStatus.push(order);
        }

        if(!mongoInfo.driver_name){
          ordersOldNotDriverToUpdate.push(order);
        }

      });
      

      // 1️⃣ Cập nhật đơn cũ có thay đổi trạng thái
      const updateStatusPromise =
        ordersOldToUpdateStatus?.length > 0
          ? this.channelOrderSchemaService.updateOrderHistoryForGrabFoodV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              ordersOldToUpdateStatus
            )
          : Promise.resolve();

      // 2️⃣ Cập nhật đơn cũ chưa có tài xế
      const updateDriverPromise =
        ordersOldNotDriverToUpdate?.length > 0
          ? (async () => {
              const ordersWithDetail: any[] = [];

              await Promise.allSettled(
                ordersOldNotDriverToUpdate.map((order) =>
                  limit(async () => {
                    const dataDetail =
                      await this.syncChannelOrderGrfService.getDriverInfo(
                        order.url_detail ??
                          ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                        order.access_token,
                        order.order_id,
                        order.display_id
                      );

                    if (dataDetail.status === HttpStatus.OK) {
                      Object.assign(order, {
                        driver_phone: this.formatPhoneNumber(
                          dataDetail.data.driver_phone
                        ),
                        driver_name: dataDetail.data.driver_name,
                        status_string: dataDetail.data.status_string,
                      });
                      ordersWithDetail.push(order);
                    }
                  })
                )
              );

              if (ordersWithDetail.length > 0) {
                await this.channelOrderSchemaService.updateOrdersGrabV2(
                  ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
                  ordersWithDetail
                );
              }
            })()
          : Promise.resolve();

      // ✅ 3️⃣ Chạy song song 2 tác vụ để tiết kiệm thời gian
      await Promise.all([updateStatusPromise, updateDriverPromise]);
      // return branchIdsToAddJob;
    }
    return branchIdsToAddJob;
  }

  async syncChannelOrderShfV2(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {
      // Khi báo biến

      let listChannelOrderMongo: ChannelOrderSchema[] = [];
      let listChannelOrderMongoOlds: ChannelOrderSchema[] = [];
      let listToCheckReject: any[] = [];
      let listOrderNew: ChannelOrderToMongo[] = [];
      let listOrderOld: ChannelOrderHistoryToMongo[] = [];
      let branchIds: number[] = [];
      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      let listOrderStringIds: string[] = [];
      let tokensToUpdate : any[] = []; 
      // Danh sách đơn cũ và đơn mới bên merchant
      const dataOrders = await this.piscinaService.runSyncOrderShfWorkers(
        JSON.parse(tokens)
      );

      // Lấy danh sách đơn mới và đơn cũ bên merchant
      for (const item of dataOrders) {
        if (item.status === "rejected") listToCheckReject.push(item);
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.new_datas) listOrderNew.push(...item.value.new_datas);
          if (item.value.history_datas)
            listOrderOld.push(...item.value.history_datas);
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }      

      // Chỉ cần 1 worker báo lỗi thì phải restart lại worker
      if (listToCheckReject?.length > 0) {
        await this.piscinaService.destroyPiscina(
          ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
        );
        await this.piscinaService.restartPiscina(
          ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
        );
      }

      listOrderStringIds = listOrderNew.map((order) => `${order.order_id}`).concat(listOrderOld.map((order) => `${order.order_id}`))

      listChannelOrderMongo =
        await this.channelOrderSchemaService.getOrderNewsToCheckV2(
          branchIds,
          ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
          listOrderStringIds
        );
      
      listChannelOrderMongoOlds = listChannelOrderMongo.filter(
        (order) => order.is_grpc_complete === 0
      );

      const [newProcessResult, oldProcessResult] = await Promise.all([
        this.processShfNewOrders(listOrderNew, listChannelOrderMongo, limit),
        this.processShfOldOrders(listOrderOld, listChannelOrderMongoOlds),
      ]);

      branchIds = Array.from(new Set<number>([...oldProcessResult ?? new Set<number> , ...newProcessResult ?? new Set<number>]));   
            
      if(branchIds?.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncMongoToMysql(bId);
        }
      }

      if(tokensToUpdate?.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async processShfNewOrders(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Set<number>> {
    let branchIdsToAddJob: Set<number> = new Set();

    if (!listOrderNew?.length) return branchIdsToAddJob;

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];
    // Lấy danh sách ids đơn hàng trong Mongo trong ngày hôm nay
    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}${order.branch_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_branch_check}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);
        branchIdsToAddJob.add(order.branch_id);

      } else {
        const statusChanged = order.order_status !== mongoInfo.order_status;
        const driverChanged = order.driver_name !== mongoInfo.driver_name;
    
        if (statusChanged || driverChanged) {
          ordersToUpdate.push(order);
          branchIdsToAddJob.add(order.branch_id);
        }
      }
    }

    await Promise.allSettled([
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
    
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const dataDetail: any =
                await this.syncChannelOrderShfService.getOrderDetail(
                  order.url_detail,
                  order.access_token,
                  order.order_id,
                  order.order_code,
                  order.channel_branch_id,
                  order.x_sap_ri
                );
    
              if (dataDetail.status === HttpStatus.OK) {
                Object.assign(order, {
                  customer_name: dataDetail.data.customer_name,
                  customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                  delivery_address: dataDetail.data.customer_address,
                  driver_phone: this.formatPhoneNumber(order.driver_phone),
                });
              }
    
              ordersWithDetail.push(order);
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);
        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng cũ
      (async () => {
        if (ordersToUpdate?.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
            ordersToUpdate
          );
        }
      })(),
    ]);
    

    return branchIdsToAddJob;
  }

  async processShfOldOrders(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[],
  ): Promise<Set<number>> {
  
    const branchIdsToAddJob = new Set<number>();
  
    if (!listOrderOld?.length || !listChannelOrderMongoOlds?.length) {
      return branchIdsToAddJob;
    }
  
    // 🔹 Gom thông tin Mongo vào chung 1 Map duy nhất để lookup nhanh
    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongoOlds) {
      mongoMap.set(`${order.order_id}${order.branch_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    const ordersOldToUpdate = listOrderOld.filter((order) => {
      const mongoInfo = mongoMap.get(`${order.order_branch_check}`);
      if (!mongoInfo) return false; // không có trong Mongo
  
      const statusChanged = order.order_status !== mongoInfo.order_status;
      const driverChanged = order.driver_name  !== mongoInfo.driver_name;
      
      if (statusChanged || driverChanged) {
        branchIdsToAddJob.add(order.branch_id)
      }
      return statusChanged || driverChanged;
    });    
  
    // 🔹 Cập nhật nếu có thay đổi
    if (ordersOldToUpdate?.length > 0) {
      await this.channelOrderSchemaService.updateOrderHistoriesV2(
        ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
        ordersOldToUpdate,
      );
    }
  
    return branchIdsToAddJob;
  }
  
  async syncChannelOrderBefV2(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {
      // Khi báo biến

      let listChannelOrderMongo: ChannelOrderSchema[] = [];
      let listChannelOrderMongoOlds: ChannelOrderSchema[] = [];
      let listToCheckReject: any[] = [];
      let listOrderNew: ChannelOrderToMongo[] = [];
      let listOrderOld: ChannelOrderHistoryToMongo[] = [];
      let branchIds: number[] = [];
      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      let listOrderStringIds: string[] = [];
      let tokensToUpdate : any[] = []; 
      // Danh sách đơn cũ và đơn mới bên merchant
      const dataOrders = await this.piscinaService.runSyncOrderBefWorkers(
        JSON.parse(tokens)
      );

      // Lấy danh sách đơn mới và đơn cũ bên merchant
      for (const item of dataOrders) {
        if (item.status === "rejected") listToCheckReject.push(item);
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.new_datas) listOrderNew.push(...item.value.new_datas);
          if (item.value.history_datas)
            listOrderOld.push(...item.value.history_datas);
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }

      // Chỉ cần 1 worker báo lỗi thì phải restart lại worker
      if (listToCheckReject?.length > 0) {
        await this.piscinaService.destroyPiscina(
          ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
        );
        await this.piscinaService.restartPiscina(
          ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
        );
      }

      listOrderStringIds = listOrderNew.map((order) => `${order.order_id}`).concat(listOrderOld.map((order) => `${order.order_id}`))

      listChannelOrderMongo =
        await this.channelOrderSchemaService.getOrderNewsToCheckV2(
          branchIds,
          ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
          listOrderStringIds
        );
      
      listChannelOrderMongoOlds = listChannelOrderMongo.filter(
        (order) => order.is_grpc_complete === 0
      );

      const [newProcessResult, oldProcessResult] = await Promise.all([
        this.processBefNewOrders(listOrderNew, listChannelOrderMongo, limit),
        this.processBefOldOrders(listOrderOld, listChannelOrderMongoOlds),
      ]);

      branchIds = Array.from(new Set<number>([...oldProcessResult ?? new Set<number>, ...newProcessResult ?? new Set<number>]));      

      if(branchIds?.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncMongoToMysql(bId);
        }
      }

      if(tokensToUpdate?.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async processBefNewOrders(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Set<number>> {
    let branchIdsToAddJob: Set<number> = new Set();

    if (!listOrderNew?.length) return branchIdsToAddJob;

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];

    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}${order.branch_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_branch_check}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);
        branchIdsToAddJob.add(order.branch_id);

      } else {
        const statusChanged = order.order_status !== mongoInfo.order_status;
        const driverChanged = order.driver_name !== mongoInfo.driver_name;
    
        if (statusChanged || driverChanged) {
          ordersToUpdate.push(order);
          branchIdsToAddJob.add(order.branch_id);
        }
      }
    }

    await Promise.allSettled([
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
    
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const dataDetail: any =
                await this.syncChannelOrderBefService.getOrderDetail(
                  order.url_detail ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_DETAIL,
                  order.access_token,
                  order.order_id,
                  order.channel_branch_id,
                  order.merchant_id
                );
    
              if (dataDetail.status === HttpStatus.OK) {
                Object.assign(order, {
                  discount_amount: dataDetail.data.discount_amount,
                  total_amount: dataDetail.data.total_amount,
                  customer_order_amount: dataDetail.data.customer_order_amount,
                  customer_discount_amount: dataDetail.data.customer_discount_amount,
                  delivery_address: dataDetail.data.customer_address,
                  customer_name: dataDetail.data.customer_name,
                  customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                  details: JSON.stringify(dataDetail.data.foods),
                  note: dataDetail.data.note,
                  item_discount_amount: dataDetail.data.item_discount_amount,
                  driver_phone: this.formatPhoneNumber(order.driver_phone),
                });
    
                ordersWithDetail.push(order);
              }
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);
        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng mới đã có tài xế
      (async () => {
        if (ordersToUpdate?.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
            ordersToUpdate
          );
        }
      })(),
    ]);
    
  
    return branchIdsToAddJob;
  }

  async processBefOldOrders(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[]
  ): Promise<Set<number>> {

    let branchIdsToAddJob: Set<number> = new Set();
    let ordersOldToUpdate : ChannelOrderHistoryToMongo[] = [];

    if (listOrderOld && listOrderOld.length > 0) {
      
      // 🔹 Gom thông tin Mongo vào chung 1 Map duy nhất để lookup nhanh
    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongoOlds) {
      mongoMap.set(`${order.order_id}${order.branch_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    ordersOldToUpdate = listOrderOld.filter((order) => {
      const mongoInfo = mongoMap.get(`${order.order_branch_check}`);
      if (!mongoInfo) return false; // không có trong Mongo
  
      const statusChanged = order.order_status !== mongoInfo.order_status;
      const driverChanged = order.driver_name  !== mongoInfo.driver_name;
      
      if (statusChanged || driverChanged) {
        branchIdsToAddJob.add(order.branch_id)
      }
      return statusChanged || driverChanged;
    });    
  
    if (ordersOldToUpdate?.length > 0) {
      await this.channelOrderSchemaService.updateOrderHistoriesV2(
         ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
         ordersOldToUpdate
       );
    }

    return branchIdsToAddJob;
    }
  }

  async addJobHandleSyncMongoToMysql(branchId : number) {
      
    await this.queueSyncChannelOrderMongoToMysql.add(
      "job-queue:sync-channel-order-mongo-to-mysql",
      {
        ...{
          branch_id : branchId,
        },
      },
      { jobId : `${branchId}`,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 0,
      }
    );
  }

  async addJobHandleToken(branchId:number, token : string) {
      
    await this.queueSyncTokenExpired.add(
      "job-queue:sync-token-expired",
      {
        ...{
          branch_id : branchId,
          tokens: token,
        },
      },
      { removeOnComplete: true,
        removeOnFail: true,
        delay: 0,
      }
    );
  }

  // ---------------------------------------- v3 ------------------------------------
  async syncChannelOrderShfV3(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {
     
      let branchIds: number[] = [];
      let tokensToUpdate : any[] = []; 
      const dataOrders = await this.piscinaService.runSyncOrderShfWorkersV2(
        JSON.parse(tokens)
      );

      // Lấy danh sách đơn mới và đơn cũ bên merchant
      for (const item of dataOrders) {
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }  
            
      if(branchIds?.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncOrderByBranch(bId,ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER);
        }
      }

      if(tokensToUpdate?.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async syncChannelOrderShfByBranch(branchId: number) {

    try {

      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      const redisServiceSingleton = new RedisService().getClient();
      const hashKey = `branch-${branchId}-shopeefood:orders:hash`;
      const listChannelOrderMongoForNew: ChannelOrderSchema[] = [];
      const listChannelOrderMongoForOld: ChannelOrderSchema[] = [];

      const [listOrderNew , listOrderOld , listChannelOrderMongo] = await Promise.all([
        this.getValuesFromSetNewAndClear(`branch_id-${branchId}-shoppefood-new:set`,redisServiceSingleton),
        this.getValuesFromSetOldAndClear(`branch_id-${branchId}-shoppefood-old:set`,redisServiceSingleton),
        this.getChannelOrderMongoRedisHash(branchId,+ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,redisServiceSingleton,hashKey)
      ]);

      const newOrderIdSet =
      listOrderNew?.length > 0
        ? new Set(listOrderNew.map((order) => `${order.order_id}`))
        : null;

      const oldOrderIdSet =
        listOrderOld?.length > 0
          ? new Set(listOrderOld.map((order) => `${order.order_id}`))
          : null;


      if (listChannelOrderMongo?.length && (newOrderIdSet || oldOrderIdSet)) {
        for (const order of listChannelOrderMongo) {
          const key = `${order.order_id}`;
          if (newOrderIdSet?.has(key)) {
            listChannelOrderMongoForNew.push(order);
          }
          if (oldOrderIdSet?.has(key)) {
            listChannelOrderMongoForOld.push(order);
          }
        }
      }

      const [newProcessResultMap,oldProcessResultMap ] = await Promise.all([
        this.processShfNewOrdersV2(listOrderNew, listChannelOrderMongoForNew, limit),
        this.processShfOldOrdersV2(listOrderOld, listChannelOrderMongoForOld),
      ]);

      const mapFinal = new Map<string, OrderRedisMapValue>([
        ...newProcessResultMap,
        ...oldProcessResultMap,
      ]);

      if(mapFinal?.size > 0){
        
        const pipeline = redisServiceSingleton.pipeline();
  
        for (const [orderId, order] of mapFinal) {
          pipeline.hset(hashKey, orderId, JSON.stringify(order));
        }
        pipeline.expire(hashKey, 10800);
        await pipeline.exec();

        await this.addJobHandleSyncMongoToMysql(branchId);

      }

    } catch (error) {
      console.log(error);
    }
  }

  async processShfNewOrdersV2(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Map<string, OrderRedisMapValue>> {
    // let ordersToCreateRedis: ChannelOrderToMongo[]= [];

    let orderRedisMaps = new Map<string, OrderRedisMapValue>();

    if (!listOrderNew?.length) return new Map<string, OrderRedisMapValue>();

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];
    // Lấy danh sách ids đơn hàng trong Mongo trong ngày hôm nay
    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_id}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);

      } else {
        const statusChanged = order.order_status !== mongoInfo.order_status;
        const driverChanged = order.driver_name !== mongoInfo.driver_name;
    
        if (statusChanged || driverChanged) {
          ordersToUpdate.push(order);
        }
      }
    }

    await Promise.allSettled([
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
          
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const missingDetail =
                !order.customer_name || !order.delivery_address;

              const headers = await UtilsBaseFunction.getHeaderShoppeg();

              if (missingDetail) {
                const dataDetail: any =
                  await this.syncChannelOrderShfService.getOrderDetailV2(
                    order.url_detail,
                    order.access_token,
                    order.order_id,
                    order.order_code,
                    order.channel_branch_id,
                    order.x_sap_ri,
                    headers
                  );
        
                if (dataDetail.status === HttpStatus.OK) {                  

                  Object.assign(order, {
                    customer_name: dataDetail.data.customer_name,
                    customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                    delivery_address: dataDetail.data.customer_address,
                    driver_phone: this.formatPhoneNumber(order.driver_phone),
                  });
                }
              }
              
              ordersWithDetail.push(order);
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);

          for (const order of converted) {
            orderRedisMaps.set(`${order.order_id}`, {
              order_id : order.order_id,
              display_id : order.display_id,
              order_status: Number(order.order_status ?? -1),
              driver_name: order.driver_name ?? '',
              status_string : order.status_string,
              is_new : 1
            });
          };
        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng cũ
      (async () => {
        if (ordersToUpdate?.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
            ordersToUpdate
          );

          for (const order of ordersToUpdate) {
            orderRedisMaps.set(`${order.order_id}`, {
              order_id : order.order_id,
              display_id : order.display_id,
              order_status: Number(order.order_status ?? -1),
              driver_name: order.driver_name ?? '',
              status_string : order.status_string,
              is_new : 0
            });
          };
        }
      })(),
    ]);
    

    return orderRedisMaps;
  }

  async processShfOldOrdersV2(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[],
  ): Promise<Map<string, OrderRedisMapValue>> {
  
    let orderRedisMaps = new Map<string, OrderRedisMapValue>();
  
    if (!listOrderOld?.length || !listChannelOrderMongoOlds?.length) {
      return orderRedisMaps;
    }
  
    // 🔹 Gom thông tin Mongo vào chung 1 Map duy nhất để lookup nhanh
    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongoOlds) {
      mongoMap.set(`${order.order_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    const ordersOldToUpdate = listOrderOld.filter((order) => {
      const mongoInfo = mongoMap.get(`${order.order_id}`);
      if (!mongoInfo) return false; // không có trong Mongo
  
      const statusChanged = order.order_status !== mongoInfo.order_status;
      const driverChanged = order.driver_name  !== mongoInfo.driver_name;
           
      return statusChanged || driverChanged;
    });    
  
    // 🔹 Cập nhật nếu có thay đổi
    if (ordersOldToUpdate?.length > 0) {
      await this.channelOrderSchemaService.updateOrderHistoriesV2(
        ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
        ordersOldToUpdate,
      );

      for (const order of ordersOldToUpdate) {
        orderRedisMaps.set(`${order.order_id}`, {
          order_id : order.order_id,
          display_id : order.display_id,
          order_status: Number(order.order_status ?? -1),
          driver_name: order.driver_name ?? '',
          status_string : order.status_string,
          is_new : 0
        });
      };
    }
  
    return orderRedisMaps;
  }

  async syncChannelOrderGrfV3(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {
   
      let branchIds: number[] = [];
      let tokensToUpdate : any[] = []; 
      const dataOrders = await this.piscinaService.runSyncOrderGrfWorkersV2(
        JSON.parse(tokens)
      );

      // Lấy danh sách đơn mới và đơn cũ bên merchant
      for (const item of dataOrders) {
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }

      if(branchIds?.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncOrderByBranch(bId,ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER);
        }
      }

      if(tokensToUpdate.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async syncChannelOrderGrfByBranch(branchId: number) {

    try {

      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      const redisServiceSingleton = new RedisService().getClient();
      const hashKey = `branch-${branchId}-grabfood:orders:hash`;
      const listChannelOrderMongoForNew: ChannelOrderSchema[] = [];
      const listChannelOrderMongoForOld: ChannelOrderSchema[] = [];

      const [listOrderNew , listOrderOld , listChannelOrderMongo] = await Promise.all([
        this.getValuesFromSetNewAndClear(`branch_id-${branchId}-grabfood-new:set`,redisServiceSingleton),
        this.getValuesFromSetOldAndClear(`branch_id-${branchId}-grabfood-old:set`,redisServiceSingleton),
        this.getChannelOrderMongoRedisHash(branchId,+ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,redisServiceSingleton,hashKey)
      ]);

      const newOrderIdSet =
      listOrderNew?.length > 0
        ? new Set(listOrderNew.map((order) => `${order.order_id}${order.display_id}`))
        : null;

      const oldOrderIdSet =
        listOrderOld?.length > 0
          ? new Set(listOrderOld.map((order) => `${order.order_id}${order.display_id}`))
          : null;


      if (listChannelOrderMongo?.length && (newOrderIdSet || oldOrderIdSet)) {
        for (const order of listChannelOrderMongo) {
          const key = `${order.order_id}${order.display_id}`;
          if (newOrderIdSet?.has(key)) {
            listChannelOrderMongoForNew.push(order);
          }
          if (oldOrderIdSet?.has(key)) {
            listChannelOrderMongoForOld.push(order);
          }
        }
      }

      const [newProcessResultMap,oldProcessResultMap ] = await Promise.all([
        this.processGrfNewOrdersV2(listOrderNew, listChannelOrderMongoForNew, limit),
        this.processGrfOldOrdersV2(listOrderOld, listChannelOrderMongoForOld,limit),
      ]);

      const mapFinal = new Map<string, OrderRedisMapValue>([
        ...newProcessResultMap,
        ...oldProcessResultMap,
      ]);

      if(mapFinal?.size > 0){
        
        const pipeline = redisServiceSingleton.pipeline();
  
        for (const [orderId, order] of mapFinal) {
          pipeline.hset(hashKey, orderId, JSON.stringify(order));
        }
        pipeline.expire(hashKey, 10800);
        await pipeline.exec();

        await this.addJobHandleSyncMongoToMysql(branchId);

      }

    } catch (error) {
      console.log(error);
    }
  }

  async processGrfNewOrdersV2(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Map<string, OrderRedisMapValue>> {

    let orderRedisMaps = new Map<string, OrderRedisMapValue>();

    if (!listOrderNew?.length) return orderRedisMaps;

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToUpdateDriver: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];
    const listChannelOrderMongoNotDriverIds = new Set();
   
    const mongoMap = new Map<string,{ status_string: string; driver_name: string }>();
    // Tạo map nhanh từ Mongo
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}${order.display_id}`, {
        status_string: order.status_string ?? "",
        driver_name: order.driver_name ?? "",
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_id}${order.display_id}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);

      } else {
        const statusChanged = order.status_string !== mongoInfo.status_string;
        if (statusChanged && mongoInfo.driver_name) {
          order.driver_name = mongoInfo.driver_name;
          ordersToUpdate.push(order);
        }

        if (!mongoInfo.driver_name || mongoInfo.driver_name.trim() === "") {
          ordersToUpdateDriver.push(order);
        }
      }    
    }

    const tasks = [
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
    
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const dataDetail =
                await this.syncChannelOrderGrfService.getOrderDetail(
                  order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                  order.access_token,
                  order.order_id,
                  order.display_id
                );
    
              if (dataDetail.status === HttpStatus.OK) {
                Object.assign(order, {
                  customer_order_amount: dataDetail.data.customer_order_amount,
                  customer_discount_amount: dataDetail.data.customer_discount_amount,
                  customer_name: dataDetail.data.customer_name,
                  customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                  delivery_address: dataDetail.data.customer_address,
                  driver_phone: this.formatPhoneNumber(dataDetail.data.driver_phone),
                  driver_name: dataDetail.data.driver_name,
                  delivery_amount: dataDetail.data.delivery_amount,
                  small_order_amount: dataDetail.data.small_order_amount,
                  details: JSON.stringify(dataDetail.data.item_infos),
                  note: dataDetail.data.note,
                  item_discount_amount: dataDetail.data.item_discount_amount,
                  discount_amount: dataDetail.data.discount_amount,
                });
    
                ordersWithDetail.push(order);
              }
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);

          for (const order of converted) {
            orderRedisMaps.set(`${order.order_id}${order.display_id}`, {
              order_id : order.order_id,
              display_id : order.display_id,
              order_status: 0,
              driver_name: order.driver_name ?? '',
              status_string : order.status_string,
              is_new : 1
            });
          };
        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng mới đã có tài xế
      (async () => {
        if (ordersToUpdate?.length > 0) {
          const filtered = ordersToUpdate.filter(
            (order) =>
              !listChannelOrderMongoNotDriverIds.has(`${order.order_id}${order.display_id}`)
          );
          if (filtered.length > 0) {
            await this.channelOrderSchemaService.updateOrderNewsForGrabFoodV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              filtered
            );

            for (const order of filtered) {
              orderRedisMaps.set(`${order.order_id}${order.display_id}`, {
                order_id : order.order_id,
                display_id : order.display_id,
                order_status: 0,
                driver_name: order.driver_name ?? '',
                status_string : order.status_string,
                is_new : 0
              });
            };
          }
        }
      })(),
    
      // 3️⃣ Nhóm cập nhật đơn có tài xế (driver info)
      (async () => {
        if (ordersToUpdateDriver?.length > 0) {
          const ordersWithDetail: any[] = [];
    
          await Promise.allSettled(
            ordersToUpdateDriver.map((order) =>
              limit(async () => {
                const dataDetail =
                  await this.syncChannelOrderGrfService.getDriverInfo(
                    order.url_detail ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                    order.access_token,
                    order.order_id,
                    order.display_id
                  );
    
                if (dataDetail.status === HttpStatus.OK) {
                  Object.assign(order, {
                    driver_phone: dataDetail.data.driver_phone,
                    driver_name: dataDetail.data.driver_name,
                    status_string: dataDetail.data.status_string,
                  });
    
                  ordersWithDetail.push(order);
                }
              })
            )
          );
    
          const valid = ordersWithDetail.filter(
            (order) => order.driver_phone !== "" && order.driver_name !== ""
          );
    
          if (valid.length > 0) {
            await this.channelOrderSchemaService.updateOrdersGrabV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              valid
            );

            for (const order of valid) {
              orderRedisMaps.set(`${order.order_id}${order.display_id}`, {
                order_id : order.order_id,
                display_id : order.display_id,
                order_status: 0,
                driver_name: order.driver_name ?? '',
                status_string : order.status_string,
                is_new : 0
              });
            };
          }
        }
      })(),
    ];
    
    await Promise.allSettled(tasks);
    
    return orderRedisMaps;
  }

  async processGrfOldOrdersV2(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Map<string, OrderRedisMapValue>> {

    let orderRedisMaps = new Map<string, OrderRedisMapValue>();

    let ordersOldNotDriverToUpdate : ChannelOrderHistoryToMongo[] = [];
    let ordersOldToUpdateStatus : ChannelOrderHistoryToMongo[] = [];

    if (listOrderOld && listOrderOld?.length > 0) {

      const mongoMap = new Map(
        listChannelOrderMongoOlds.map(order => [
          `${order.order_id}${order.display_id}`,
          {
            status_string: order.status_string ?? "",
            driver_name: order.driver_name ?? "",
          },
        ])
      );
      
      listOrderOld.forEach(order => {
        const mongoInfo = mongoMap.get(`${order.order_id}${order.display_id}`);
        if (!mongoInfo) return;
      
        const statusChanged = order.status_string !== mongoInfo.status_string;
      
        if (statusChanged && mongoInfo.driver_name) {
          order.driver_name = mongoInfo.driver_name;
          ordersOldToUpdateStatus.push(order);
        }

        if(!mongoInfo.driver_name){
          ordersOldNotDriverToUpdate.push(order);
        }

      });

      // 1️⃣ Cập nhật đơn cũ có thay đổi trạng thái
      const updateStatusPromise =
      ordersOldToUpdateStatus?.length > 0
        ? (async () => {
            // Gọi DB update trước
            await this.channelOrderSchemaService.updateOrderHistoryForGrabFoodV2(
              ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              ordersOldToUpdateStatus
            );
    
            // Sau khi DB OK thì fill vào map để sync Redis
            for (const order of ordersOldToUpdateStatus) {
              orderRedisMaps.set(`${order.order_id}${order.display_id}`, {
                order_id: order.order_id,
                display_id: order.display_id,
                order_status: 0,
                driver_name: order.driver_name ?? '',
                status_string: order.status_string,
                is_new: 0, // đơn cũ
              });
            }
          })()
        : Promise.resolve();

      // 2️⃣ Cập nhật đơn cũ chưa có tài xế
      const updateDriverPromise =
        ordersOldNotDriverToUpdate?.length > 0
          ? (async () => {
              const ordersWithDetail: any[] = [];

              await Promise.allSettled(
                ordersOldNotDriverToUpdate.map((order) =>
                  limit(async () => {
                    const dataDetail =
                      await this.syncChannelOrderGrfService.getDriverInfo(
                        order.url_detail ??
                          ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
                        order.access_token,
                        order.order_id,
                        order.display_id
                      );

                    if (dataDetail.status === HttpStatus.OK) {
                      Object.assign(order, {
                        driver_phone: this.formatPhoneNumber(
                          dataDetail.data.driver_phone
                        ),
                        driver_name: dataDetail.data.driver_name,
                        status_string: dataDetail.data.status_string,
                      });
                      ordersWithDetail.push(order);
                    }
                  })
                )
              );

              if (ordersWithDetail.length > 0) {
                await this.channelOrderSchemaService.updateOrdersGrabV2(
                  ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
                  ordersWithDetail
                );
              }

              for (const order of ordersWithDetail) {
                orderRedisMaps.set(`${order.order_id}${order.display_id}`, {
                  order_id : order.order_id,
                  display_id : order.display_id,
                  order_status: 0,
                  driver_name: order.driver_name ?? '',
                  status_string : order.status_string,
                  is_new : 0
                });
              };

            })()
          : Promise.resolve();

      // ✅ 3️⃣ Chạy song song 2 tác vụ để tiết kiệm thời gian
      await Promise.all([updateStatusPromise, updateDriverPromise]);
      // return branchIdsToAddJob;
    }
    return orderRedisMaps;
  }

  async syncChannelOrderBefV3(tokens: string) {
    /**
     *
     * Bước 1: Lấy được danh sách đơn hàng bên GRAB (chưa là trạng thái cuối).
     * Bước 2 Lấy danh sách đơn hàng ngày hôm nay bên dưới mongoDB
     * Bước 3:
     *  Tách ra làm 3 mãng bằng các so sánh dữ liệu Bước 1 và Bước 2
     *  - Mãng 1 danh sách đơn hàng mới đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  - Mãng 2 danh sách đơn hàng mới chưa có tài xế --> để cập nhật dữ liệu
     *  - Mãng 3 danh sác đơn hang chưa có trong mongo --> để tạo mới
     *
     * Bước 4:
     *  Mãng 1 chỉ vào DB mongo cập nhật đè dữ liệu
     *  Mãng 2, 3 phải gọi sang GRAB để lấy thông tin chi tiết để cập nhật dữ liệu
     *
     *
     * Bước 5: Lấy được danh sách đơn hàng bên GRAB (là trạng thái cuối).
     * Bước 6:
     *  Tách ra làm 2 mãng
     *  Mãng 1 danh sách đơn hàng cũ đã tồn tại trong mongo --> để cập nhật dữ liệu
     *  Mang 2 danh sách đơn hàng cũ chưa có tài xế --> để cập nhật dữ liệu
     *
     *
     * Bước 7: Gửi tín hiệu KAFKA lên cho processor để xử lý
     *  . Xử lý đơn hàng khi cột is_updated = 1
     *  . Nếu có token mới thì xử lý update token và có key redis
     *
     */

    try {

      let tokensToUpdate : any[] = []; 
      let branchIds: number[] = [];

      // Danh sách đơn cũ và đơn mới bên merchant
      const dataOrders = await this.piscinaService.runSyncOrderBefWorkersV2(
        JSON.parse(tokens)
      );

      for (const item of dataOrders) {
        if (item.status === "fulfilled") {
          branchIds.push(Number(Number(item.value.branch_id)));
          if (item.value.access_token)
            tokensToUpdate.push({
              branch_id : item.value.branch_id,
              access_token: item.value.access_token,
              channel_order_food_token_id: item.value.channel_order_food_token_id,
            })
        }
      }

      if(branchIds?.length > 0){
        for (const bId of branchIds) {
              await this.addJobHandleSyncOrderByBranch(bId,ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER);
        }
      }

      if(tokensToUpdate?.length > 0 ){
        for (const t of tokensToUpdate) {
          await this.addJobHandleToken(t.branch_id,JSON.stringify(t));
          }
      }

    } catch (error) {
      console.log(error);
    }
  }

  async syncChannelOrderBefByBranch(branchId: number) {

    try {

      let limit = pLimit(+cpuCount); // Số lượng worker tối đa
      const redisServiceSingleton = new RedisService().getClient();
      const hashKey = `branch-${branchId}-befood:orders:hash`;
      const listChannelOrderMongoForNew: ChannelOrderSchema[] = [];
      const listChannelOrderMongoForOld: ChannelOrderSchema[] = [];

      const [listOrderNew , listOrderOld , listChannelOrderMongo] = await Promise.all([
        this.getValuesFromSetNewAndClear(`branch_id-${branchId}-befood-new:set`,redisServiceSingleton),
        this.getValuesFromSetOldAndClear(`branch_id-${branchId}-befood-old:set`,redisServiceSingleton),
        this.getChannelOrderMongoRedisHash(branchId,+ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,redisServiceSingleton,hashKey)
      ]);

      const newOrderIdSet =
      listOrderNew?.length > 0
        ? new Set(listOrderNew.map((order) => `${order.order_id}`))
        : null;

      const oldOrderIdSet =
        listOrderOld?.length > 0
          ? new Set(listOrderOld.map((order) => `${order.order_id}`))
          : null;


      if (listChannelOrderMongo?.length && (newOrderIdSet || oldOrderIdSet)) {
        for (const order of listChannelOrderMongo) {
          const key = `${order.order_id}`;
          if (newOrderIdSet?.has(key)) {
            listChannelOrderMongoForNew.push(order);
          }
          if (oldOrderIdSet?.has(key)) {
            listChannelOrderMongoForOld.push(order);
          }
        }
      }

      const [newProcessResultMap,oldProcessResultMap ] = await Promise.all([
        this.processBefNewOrdersV2(listOrderNew, listChannelOrderMongoForNew, limit),
        this.processBefOldOrdersV2(listOrderOld, listChannelOrderMongoForOld),
      ]);      

      const mapFinal = new Map<string, OrderRedisMapValue>([
        ...newProcessResultMap,
        ...oldProcessResultMap,
      ]);

      if(mapFinal?.size > 0){
        
        const pipeline = redisServiceSingleton.pipeline();
  
        for (const [orderId, order] of mapFinal) {
          pipeline.hset(hashKey, orderId, JSON.stringify(order));
        }
        pipeline.expire(hashKey, 10800);
        await pipeline.exec();

        await this.addJobHandleSyncMongoToMysql(branchId);

      }

    } catch (error) {
      console.log(error);
    }
  }

  async processBefNewOrdersV2(
    listOrderNew: ChannelOrderToMongo[],
    listChannelOrderMongo: ChannelOrderSchema[],
    limit: pLimit.Limit
  ): Promise<Map<string, OrderRedisMapValue>> {
    let orderRedisMaps = new Map<string, OrderRedisMapValue>();

    if (!listOrderNew?.length) return orderRedisMaps;

    // Khởi tạo mảng kết quả
    const ordersToUpdate: ChannelOrderToMongo[] = [];
    const ordersToCreate: ChannelOrderToMongo[] = [];

    const mongoMap = new Map<string, { order_status: number; driver_name: string}>();
    for (const order of listChannelOrderMongo) {
      mongoMap.set(`${order.order_id}`, {
        order_status: Number(order.order_status ?? -1),
        driver_name: order.driver_name ?? '',
      });
    }
  
    for (const order of listOrderNew) {
      const key = `${order.order_id}`;
      const mongoInfo = mongoMap.get(key);
    
      if (!mongoInfo) {
        ordersToCreate.push(order);

      } else {
        const statusChanged = order.order_status !== mongoInfo.order_status;
        const driverChanged = order.driver_name !== mongoInfo.driver_name;
    
        if (statusChanged || driverChanged) {
          ordersToUpdate.push(order);
        }
      }
    }

    await Promise.allSettled([
      // 1️⃣ Nhóm tạo đơn mới
      (async () => {
        const ordersWithDetail: any[] = [];
    
        await Promise.allSettled(
          ordersToCreate.map((order) =>
            limit(async () => {
              const dataDetail: any =
                await this.syncChannelOrderBefService.getOrderDetail(
                  order.url_detail ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_DETAIL,
                  order.access_token,
                  order.order_id,
                  order.channel_branch_id,
                  order.merchant_id
                );
    
              if (dataDetail.status === HttpStatus.OK) {
                Object.assign(order, {
                  discount_amount: dataDetail.data.discount_amount,
                  total_amount: dataDetail.data.total_amount,
                  customer_order_amount: dataDetail.data.customer_order_amount,
                  customer_discount_amount: dataDetail.data.customer_discount_amount,
                  delivery_address: dataDetail.data.customer_address,
                  customer_name: dataDetail.data.customer_name,
                  customer_phone: this.formatPhoneNumber(dataDetail.data.customer_phone),
                  details: JSON.stringify(dataDetail.data.foods),
                  note: dataDetail.data.note,
                  item_discount_amount: dataDetail.data.item_discount_amount,
                  driver_phone: this.formatPhoneNumber(order.driver_phone),
                });
    
                ordersWithDetail.push(order);
              }
            })
          )
        );
    
        const validOrders = ordersWithDetail.filter(
          (order) => order.details && order.details !== "[]"
        );
    
        if (validOrders.length > 0) {
          const converted =
            await this.channelOrderSchemaService.convertToChannelOrderSchemasV2(
              ordersWithDetail,
              +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
            );
    
          await this.channelOrderSchemaService.createMany(converted);

          for (const order of converted) {
            orderRedisMaps.set(`${order.order_id}`, {
              order_id : order.order_id,
              display_id : order.display_id,
              order_status: order.order_status,
              driver_name: order.driver_name ?? '',
              status_string : order.status_string,
              is_new : 1
            });
          };

        }
      })(),
    
      // 2️⃣ Nhóm cập nhật đơn hàng mới đã có tài xế
      (async () => {
        if (ordersToUpdate?.length > 0) {
          await this.channelOrderSchemaService.updateOrderNewsV2(
            ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
            ordersToUpdate
          );

          for (const order of ordersToUpdate) {
            orderRedisMaps.set(`${order.order_id}`, {
              order_id : order.order_id,
              display_id : order.display_id,
              order_status: order.order_status,
              driver_name: order.driver_name ?? '',
              status_string : order.status_string,
              is_new : 0
            });
          };
        }
      })(),
    ]);
    
  
    return orderRedisMaps;
  }

  async processBefOldOrdersV2(
    listOrderOld: ChannelOrderHistoryToMongo[],
    listChannelOrderMongoOlds: ChannelOrderSchema[]
  ): Promise<Map<string, OrderRedisMapValue>> {
    const orderRedisMaps = new Map<string, OrderRedisMapValue>();
    let ordersOldToUpdate: ChannelOrderHistoryToMongo[] = [];

    if (listOrderOld && listOrderOld.length > 0) {
      // 🔹 Gom thông tin Mongo vào chung 1 Map duy nhất để lookup nhanh
      const mongoMap = new Map<string, { order_status: number; driver_name: string }>();
      for (const order of listChannelOrderMongoOlds) {
        mongoMap.set(`${order.order_id}`, {
          order_status: Number(order.order_status ?? -1),
          driver_name: order.driver_name ?? '',
        });
      }

      ordersOldToUpdate = listOrderOld.filter((order) => {
        const mongoInfo = mongoMap.get(`${order.order_id}`);
        if (!mongoInfo) return false; // không có trong Mongo

        const statusChanged = order.order_status !== mongoInfo.order_status;
        const driverChanged = order.driver_name !== mongoInfo.driver_name;

        return statusChanged || driverChanged;
      });

      if (ordersOldToUpdate?.length > 0) {
        await this.channelOrderSchemaService.updateOrderHistoriesV2(
          ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
          ordersOldToUpdate,
        );

        for (const order of ordersOldToUpdate) {
          orderRedisMaps.set(`${order.order_id}`, {
            order_id: order.order_id,
            display_id: order.display_id,
            order_status: order.order_status,
            driver_name: order.driver_name ?? '',
            status_string: order.status_string,
            is_new: 0,
          });
        }
      }
    }

    // Luôn trả về Map (có thể rỗng) để tránh oldProcessResultMap bị undefined
    return orderRedisMaps;
  }

  async addJobHandleSyncOrderByBranch(branchId : number,channelOrderFoodId : number) {    

    await this.queueSyncChannelOrderByBranch.add(
      `${process.env.CONFIG_WORKER_KEY_REDIS_SYNC_CHANNEL_ORDER}-by-branch`,
      {
        ...{
          branch_id : branchId,
          channel_order_food_id:+channelOrderFoodId
        },
      },
      { jobId : `${branchId}`,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 0,
      }
    );
  }

  async getValuesFromSetNewAndClear(setKey: string, redis: any) : Promise<ChannelOrderToMongo[]> {
    // 1️⃣ Lấy danh sách key trong set

    let listOrderNew: ChannelOrderToMongo[] = [];
    // let listOrderNewRedis: any[];

    const keys = await redis.smembers(setKey);
    if (!keys || keys.length === 0) {
      // không có key → xóa luôn set
      await redis.del(setKey);
      return listOrderNew;
    }
  
    // 2️⃣ Pipeline GET tất cả value
    const pipelineGet = redis.pipeline();
    keys.forEach((key) => pipelineGet.get(key));
    const results = await pipelineGet.exec();
  
    // Parse JSON value
    results.map(([err, val]) => {
      try {

        listOrderNew = listOrderNew.concat(JSON.parse(val));       
        // return JSON.parse(val);
      } catch (error) {
        console.log(error);
        // listOrderNew
      }
    });
  
    // 3️⃣ Pipeline xoá key + xoá set
    const pipelineDel = redis.pipeline();
    // keys.forEach((key) => pipelineDel.del(key));
    pipelineDel.del(setKey);
    await pipelineDel.exec();
  
    return listOrderNew;
  }

  async getValuesFromSetOldAndClear(setKey: string, redis: any) : Promise<ChannelOrderHistoryToMongo[]> {
    // 1️⃣ Lấy danh sách key trong set

    let listOrder: ChannelOrderHistoryToMongo[] = [];

    const keys = await redis.smembers(setKey);
    if (!keys || keys.length === 0) {
      // không có key → xóa luôn set
      await redis.del(setKey);
      return listOrder;
    }
  
    // 2️⃣ Pipeline GET tất cả value
    const pipelineGet = redis.pipeline();
    keys.forEach((key) => pipelineGet.get(key));
    const results = await pipelineGet.exec();
  
    // Parse JSON value
    results.map(([err, val]) => {
      try {

        listOrder = listOrder.concat(JSON.parse(val))
        // return JSON.parse(val);
      } catch {
        listOrder
      }
    });
  
    // 3️⃣ Pipeline xoá key + xoá set
    const pipelineDel = redis.pipeline();
    // keys.forEach((key) => pipelineDel.del(key));
    pipelineDel.del(setKey);
    await pipelineDel.exec();
  
    return listOrder;
  }

  async getChannelOrderMongoRedis(branchId : number,channelOrderFoodId : number , key: string, redis: any) : Promise<ChannelOrderSchema[]> {
    // 1️⃣ Lấy danh sách key trong set
    let listChannelOrderMongo: ChannelOrderSchema[] = [];

    let listChannelOrderMongoRedis = await redis.get(key);
      if(!listChannelOrderMongoRedis){
          // listOrderStringIds = listOrderNew.map((order) => `${order.order_id}`).concat(listOrderOld.map((order) => `${order.order_id}`))

          listChannelOrderMongo =
          await this.channelOrderSchemaService.getOrderNewsToCheckV3(
          branchId,
          channelOrderFoodId
        );
        
        await redis.set(key, JSON.stringify(listChannelOrderMongo), "EX", 86400);
      }else{
        listChannelOrderMongo = JSON.parse(listChannelOrderMongoRedis);
      }

      return listChannelOrderMongo;
  }

  async getChannelOrderMongoRedisHash(
    branchId: number,
    channelOrderFoodId: number,
    redis: any,
    hashKey : string
  ): Promise<ChannelOrderSchema[]> {
    ;
  
    // 1) Thử lấy tất cả field trong hash
    const raw = await redis.hgetall(hashKey);
  
    let listChannelOrderMongo: ChannelOrderSchema[] = [];
  
    if (!raw || Object.keys(raw).length === 0) {
      // ❌ Chưa có cache trong Redis → lấy từ Mongo
      listChannelOrderMongo =
        await this.channelOrderSchemaService.getOrderNewsToCheckV3(
          branchId,
          channelOrderFoodId
        );
  
      if (listChannelOrderMongo.length > 0) {
        const pipeline = redis.pipeline();
  
        for (const order of listChannelOrderMongo) {
          pipeline.hset(hashKey,channelOrderFoodId == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER ?`${order.order_id}${order.display_id}` : order.order_id, JSON.stringify(order));
        }
  
        // set TTL cho hash
        pipeline.expire(hashKey, 10800);
  
        await pipeline.exec();
      }
    } else {
      // ✅ Có cache trong Redis → parse toàn bộ JSON
      listChannelOrderMongo = Object.values(raw).map((json: string) => {
        try {
          return JSON.parse(json) as ChannelOrderSchema;
        } catch {
          return {} as ChannelOrderSchema;
        }
      });
    }
  
    return listChannelOrderMongo;
  }
  

}
