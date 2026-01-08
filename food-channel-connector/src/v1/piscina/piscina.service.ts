import { Injectable } from "@nestjs/common";
import * as path from "path";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
const Piscina = require("piscina");
const cpuCount = require("os").cpus().length;

@Injectable()
export class PiscinaService {
  private readonly piscina: any;
  private readonly piscinaSyncOrderStatus: any;
  private piscinaSyncOrderShf: any;
  private piscinaSyncOrderGrf: any;
  private piscinaSyncOrderBef: any;
  private piscinaSyncOrderShfV2: any;
  private piscinaSyncOrderGrfV2: any;
  private piscinaSyncOrderBefV2: any;

  private readonly defaultPiscinaConfig = {
    minThreads: +(
      process.env.CONFIG_PISCINA_WORKER_IDLE_QUANTITY ?? 
      Math.max(2, Math.floor(cpuCount / 2))
    ),
    maxThreads: +cpuCount,
    idleTimeout: 5000, // Thời gian chờ trước khi xóa worker idle (5s)
    timeout: 10000,  
      // Thời gian timeout cho worker (30s)
  };

  constructor() {
    const workerPaths = {
      branches: path.resolve(__dirname, "../channel-order/get-branches-worker-v2.js"),
      orderStatus: path.resolve(__dirname, "../channel-order/update-order-status-worker.js"),
      orderShf: path.resolve(__dirname, "../channel-order/sync-channel-order-shf.js"),
      orderGrf: path.resolve(__dirname, "../channel-order/sync-channel-order-grf.js"),
      orderBef: path.resolve(__dirname, "../channel-order/sync-channel-order-bef.js"),

      orderShfV2: path.resolve(__dirname, "../channel-order/sync-channel-order-shf-v2.js"),
      orderGrfV2: path.resolve(__dirname, "../channel-order/sync-channel-order-grf-v2.js"),
      orderBefV2: path.resolve(__dirname, "../channel-order/sync-channel-order-bef-v2.js"),

    };

    // Khởi tạo các worker pools
    this.piscina = this.createPiscinaWorker(workerPaths.branches);
    this.piscinaSyncOrderStatus = this.createPiscinaWorker(workerPaths.orderStatus);
    this.piscinaSyncOrderShf = this.createPiscinaWorker(workerPaths.orderShf);
    this.piscinaSyncOrderGrf = this.createPiscinaWorker(workerPaths.orderGrf);
    this.piscinaSyncOrderBef = this.createPiscinaWorker(workerPaths.orderBef);
    this.piscinaSyncOrderShfV2 = this.createPiscinaWorker(workerPaths.orderShfV2);
    this.piscinaSyncOrderGrfV2 = this.createPiscinaWorker(workerPaths.orderGrfV2);
    this.piscinaSyncOrderBefV2 = this.createPiscinaWorker(workerPaths.orderBefV2);

  }

  private createPiscinaWorker(workerPath: string): any {
    return new Piscina({
      filename: workerPath,
      ...this.defaultPiscinaConfig
    });
  }

  async runGetBranchWorkersV2(dataArray: any[]): Promise<any> {
    const workerPromises = dataArray.map((data) => this.piscina.run(data));
    return Promise.all(workerPromises);
  }

  async runSyncOrderStatusWorkers(dataArray: any[]): Promise<any> {
    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderStatus.run(data)
    );
    return Promise.all(workerPromises);
  }

  // piscinaSyncOrderShf
  async runSyncOrderShfWorkers(dataArray: any[]): Promise<any> {    
    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderShf.run(data)
    );
    return Promise.allSettled(workerPromises);
  }

  async runSyncOrderShfWorkersV2(dataArray: any[]): Promise<any> {    
    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderShfV2.run(data)
    );
    return Promise.allSettled(workerPromises);
  }
  // piscinaSyncOrderGrf
  async runSyncOrderGrfWorkers(dataArray: any[]): Promise<any> {

    // console.log("log before threads length waitting",this.piscinaSyncOrderGrf.threads.length," queueSize length waitting",this.piscinaSyncOrderGrf.queueSize);

    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderGrf.run(data)
    );

    // console.log("log after threads length active",this.piscinaSyncOrderGrf.threads.length," queueSize length active",this.piscinaSyncOrderGrf.queueSize);

    return Promise.allSettled(workerPromises);
  }

  async runSyncOrderGrfWorkersV2(dataArray: any[]): Promise<any> {

    // console.log("log before threads length waitting",this.piscinaSyncOrderGrf.threads.length," queueSize length waitting",this.piscinaSyncOrderGrf.queueSize);

    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderGrfV2.run(data)
    );

    // console.log("log after threads length active",this.piscinaSyncOrderGrf.threads.length," queueSize length active",this.piscinaSyncOrderGrf.queueSize);

    return Promise.allSettled(workerPromises);
  }

  async getInfor(): Promise<string> {
    return `result threads length ${this.piscinaSyncOrderGrf.threads.length} queueSize length ${this.piscinaSyncOrderGrf.queueSize}`;
  }

  // piscinaSyncOrderBef
  async runSyncOrderBefWorkers(dataArray: any[]): Promise<any> {
    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderBef.run(data)
    );
    return Promise.allSettled(workerPromises);
  }

  async runSyncOrderBefWorkersV2(dataArray: any[]): Promise<any> {
    const workerPromises = dataArray.map((data) =>
      this.piscinaSyncOrderBefV2.run(data)
    );
    return Promise.allSettled(workerPromises);
  }

  async destroyPiscina(channelOrderFoodId: number): Promise<any> {
    try {
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
        // console.log('🔄 Đang hủy piscinaSyncOrderShf...');
        await this.piscinaSyncOrderShf.destroy();
        // console.log('✅ Đã hủy piscinaSyncOrderShf');
      }
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
        // console.log('🔄 Đang hủy piscinaSyncOrderGrf...');
        await this.piscinaSyncOrderGrf.destroy();
        // console.log('✅ Đã hủy piscinaSyncOrderGrf');
      }
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
        // console.log('🔄 Đang hủy piscinaSyncOrderBef...');
        await this.piscinaSyncOrderBef.destroy();
        // console.log('✅ Đã hủy piscinaSyncOrderBef');
      }
      
      // return { success: true, message: 'Đã hủy worker pool thành công' };
    } catch (error) {
      // console.error('❌ Lỗi khi hủy worker pool:', error);
      // return { success: false, error: error.message };
    }
  }

  async restartPiscina(channelOrderFoodId: number): Promise<any> {
    try {
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER) {
        // console.log('🔄 Đang tạo lại piscinaSyncOrderShf...');
        this.piscinaSyncOrderShf = this.createPiscinaWorker(path.resolve(__dirname, "../channel-order/sync-channel-order-shf.js"));
        // console.log('✅ Đã tạo lại piscinaSyncOrderShf');
      }
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER) {
        // console.log('🔄 Đang tạo lại piscinaSyncOrderGrf...');
        this.piscinaSyncOrderGrf = this.createPiscinaWorker(path.resolve(__dirname, "../channel-order/sync-channel-order-grf.js"));
        // console.log('✅ Đã tạo lại piscinaSyncOrderGrf');
      }
      if (channelOrderFoodId == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER) {
        // console.log('🔄 Đang tạo lại piscinaSyncOrderBef...');
        this.piscinaSyncOrderBef = this.createPiscinaWorker(path.resolve(__dirname, "../channel-order/sync-channel-order-bef.js"));
        // console.log('✅ Đã tạo lại piscinaSyncOrderBef');
      }
      
      // return { success: true, message: 'Đã tạo lại worker pool thành công' };
    } catch (error) {
      // console.error('❌ Lỗi khi tạo lại worker pool:', error);
      // return { success: false, error: error.message };
    }
  }
}
