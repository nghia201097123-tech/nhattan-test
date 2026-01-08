import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionStoreProcedure } from 'src/utils.common/utils.exception.common/utils.store-procedure-exception.common';
import { Pagination } from 'src/utils.common/utils.pagination.pagination/utils.pagination';
import { StoreProcedureResultOutput } from 'src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result-output-common';
import { StoreProcedureResult } from 'src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common';
import { StoreProcedureOutputResultInterface } from 'src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common';
import { In, Repository } from 'typeorm';
import { ChannelOrderDetailEntity } from './entity/channel-order-detail.entity';
import { ChannelOrderEntity } from './entity/channel-order.entity';
import { SyncChannelOrderEntity } from './entity/sync-channel-orders.entity';
import { foodChannelObjectDataModel } from './model/food-channel-object.data.model';
import { ChannelFoodCheckOrderRefreshDataModel } from './model/channel-food-check-order-refresh.data.model';
import { ChannelOrderByIdsDataModel } from './model/channel-order-by-ids.data.model';
import { ChannelOrderDetailDataEntity } from './entity/channel-order-detail-data.entity';
import { ChannelFoodTokenGrabfoodDataModel } from '../channel-order-food/model/channel-food-token-grabfood.data.model';
import { ChannelOrderPrintEntity } from './entity/channel-order-print.entity';
import { ChannelOrderListOutputDataModel } from '../channel-order-food/model/channel-order-list.output.data.model';
import { ChannelOrderByIdDataModel } from './model/channel-order-by-id.data.model';
import { ChannelOrderDriverEntity } from './entity/channel-order-driver.entity';

@Injectable()
export class SyncChannelOrdersService {
  constructor(
    @InjectRepository(SyncChannelOrderEntity)
    private readonly syncChannelOrdersRepository: Repository<SyncChannelOrderEntity>,
    @InjectRepository(ChannelOrderDetailEntity)
    private readonly channelOrderDetailEntityRepository: Repository<ChannelOrderDetailEntity>,
    @InjectRepository(ChannelOrderEntity)
    private readonly channelOrderEntityRepository: Repository<ChannelOrderEntity>,
    @InjectRepository(ChannelOrderDetailDataEntity)
    private readonly channelOrderDetailDataEntityRepository: Repository<ChannelOrderDetailDataEntity>,
    @InjectRepository(ChannelOrderPrintEntity)
    private readonly channelOrderPrintEntityRepository: Repository<ChannelOrderPrintEntity>,
    @InjectRepository(ChannelOrderDriverEntity)
    private readonly channelOrderDriverEntityRepository: Repository<ChannelOrderDriverEntity>,
  ) { }

  // async findAllNotSync(restaurant_id: number,
  //   restaurant_brand_id: number,
  //   channel_order_food_id: number): Promise<SyncChannelOrderEntity[]> {
  //   return await this.syncChannelOrdersRepository.find({
  //     where: {
  //       restaurant_id,
  //       restaurant_brand_id,
  //       channel_order_food_id,
  //       is_sync: 0
  //     },
  //   });
  // }

  async getDetails(
    channel_order_id: number): Promise<ChannelOrderDetailEntity[]> {
    return await this.channelOrderDetailEntityRepository.find({
      where: {
        channel_order_id
      },
    });
  }

  async getDetailsData(
    channel_order_id: number): Promise<ChannelOrderDetailDataEntity[]> {
    return await this.channelOrderDetailDataEntityRepository.find({
      where: {
        channel_order_id
      },
    });
  }

  // async getDetailsBillAppFood(
  //   channel_order_food_id: number,
  //   channel_order_food_code: string

  // ): Promise<ChannelOrderDetailEntity[]> {
  //   return await this.channelOrderDetailEntityRepository.find({
  //     where: {
  //       channel_order_food_id: channel_order_food_id,
  //       order_id: channel_order_food_code
  //     },
  //   });
  // }

  // create(syncChannelOrder: SyncChannelOrderEntity): Promise<SyncChannelOrderEntity> {
  //   return this.syncChannelOrdersRepository.save(syncChannelOrder);
  // }

  // async spUCheckSyncChannelOrderGRF(
  //   restaurantId: number,
  //   restaurantBrandId: number,
  //   branchId : number,
  //   channelOrderFoodId: number,
  //   channelBranchId: string,
  //   channelOrderFoodTokenId : number,
  //   list: any[],
  //   isNew: number
  // ): Promise<any> {

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction('READ COMMITTED');

  //     const batchSize = 50;

  //     for (let i = 0; i < list.length; i += batchSize) {

  //       const result = await queryRunner.query(`
  //     CALL sp_u_check_sync_channel_order_GRF(?, ?, ?, ?, ?, ?,?,?, @status_code, @message_error);
  //     SELECT @status_code as status_code, @message_error as message_error;
  //   `, [restaurantId, restaurantBrandId,branchId, channelOrderFoodId, channelBranchId,channelOrderFoodTokenId, JSON.stringify(list.slice(i, i + batchSize)), isNew]);

  //       if (
  //         result.length < 3 &&
  //         (parseInt(result[1][0].status_code) === StoreProcedureStatusEnum.ERROR ||
  //           parseInt(result[1][0].status_code) === StoreProcedureStatusEnum.FAIL_LOGIC)
  //       ) {
  //         await queryRunner.rollbackTransaction();
  //         // await queryRunner.release();
  //         throw new HttpException(
  //           new ExceptionResponseDetail(
  //             HttpStatus.BAD_REQUEST,
  //             result[1][0].message_error
  //           ),
  //           HttpStatus.OK
  //         );
  //       }
  //     }

  //     await queryRunner.commitTransaction();
  //     // await queryRunner.release();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // async spUChannelOrderDetailGRF(
  //   restaurantId : number,
  //   restaurantBrandId : number,
  //   branchId : number,
  //   channelOrderFoodId : number,
  //   channelBranchId : string,
  //   channelOrderFoodTokenId : number,
  //   orderId: string,
  //   customerOrderAmount : number,
  //   customerDiscountAmount: number,
  //   customerName: string,
  //   customerPhone: string,
  //   customerAddress: string,
  //   foodJsons: string
  // ): Promise<any> {

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction('READ COMMITTED');

  //     const result = await queryRunner.query(`
  //   CALL sp_u_channel_order_detail(?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ? ,?, @status_code, @message_error);
  //   SELECT @status_code as status_code, @message_error as message_error;
  // `, [restaurantId ,restaurantBrandId , branchId , channelOrderFoodId, channelBranchId , channelOrderFoodTokenId , orderId, customerOrderAmount, customerDiscountAmount ,customerName, customerPhone ,customerAddress ,foodJsons]);

  //     if (
  //       result.length < 3 &&
  //       (parseInt(result[1][0].status_code) === StoreProcedureStatusEnum.ERROR ||
  //         parseInt(result[1][0].status_code) === StoreProcedureStatusEnum.FAIL_LOGIC)
  //     ) {
  //       await queryRunner.rollbackTransaction();
  //       // await queryRunner.release();
  //       throw new HttpException(
  //         new ExceptionResponseDetail(
  //           HttpStatus.BAD_REQUEST,
  //           result[1][0].message_error
  //         ),
  //         HttpStatus.OK
  //       );
  //     }
  //     await queryRunner.commitTransaction();
  //     // await queryRunner.release();
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async spGListOrderForGrpc(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    channelBranchIds: string,
    keySearch: string,
    isHaveRestaurantOrder: number,
    pagination: Pagination
  ): Promise<StoreProcedureOutputResultInterface<any, number>> {

    const limitValue = pagination.getLimit();
    const offsetValue = pagination.getOffset();

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_order_for_grpc(?, ?, ?, ? , ?,?, ?, ?, ?,@total_record, @status_code, @message_error);
      SELECT @total_record as total_record, @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId, branchId, channelOrderFoodId, channelBranchIds, keySearch, +isHaveRestaurantOrder, limitValue, offsetValue]);

    ExceptionStoreProcedure.validate(result);

    let data: StoreProcedureOutputResultInterface<any, number> =
      new StoreProcedureResultOutput<number>().getResultOutputPagination(result);

    return data;

  }

  async spGListOrderForGrpcV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    channelBranchIds: string,
    keySearch: string,
    isHaveRestaurantOrder: number,
    pagination: Pagination
  ): Promise<StoreProcedureOutputResultInterface<any, number>> {

    const limitValue = pagination.getLimit();
    const offsetValue = pagination.getOffset();

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_order_for_grpc_v2(?, ?, ?, ? , ?,?, ?, ?, ?,@total_record, @status_code, @message_error);
      SELECT @total_record as total_record, @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId, branchId, channelOrderFoodId, channelBranchIds, keySearch, +isHaveRestaurantOrder, limitValue, offsetValue]);

    ExceptionStoreProcedure.validate(result);

    let data: StoreProcedureOutputResultInterface<any, number> =
      new StoreProcedureResultOutput<number>().getResultOutputPagination(result);

    return data;

  }

  async spGListOrderForGrpcV3(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    channelBranchIds: string,
    keySearch: string,
    isHaveRestaurantOrder: number,
    pagination: Pagination
  ): Promise<StoreProcedureOutputResultInterface<any, ChannelOrderListOutputDataModel>> {

    const limitValue = pagination.getLimit();
    const offsetValue = pagination.getOffset();

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_order_for_grpc_v3(?, ?, ?, ? , ?,?, ?, ?, ?,@total_record,@is_have_new_order, @status_code, @message_error);
      SELECT @total_record as total_record, @is_have_new_order AS is_have_new_order,@status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId, branchId, channelOrderFoodId, channelBranchIds, keySearch, +isHaveRestaurantOrder, limitValue, offsetValue]);

    ExceptionStoreProcedure.validate(result);
    
    let data: StoreProcedureOutputResultInterface<any,ChannelOrderListOutputDataModel>=
      new StoreProcedureResultOutput<ChannelOrderListOutputDataModel>().getResultOutputList(result);
      
    return data;

  }

  async spGListOrderForGrpcV4(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    channelBranchIds: string,
    keySearch: string,
    isHaveRestaurantOrder: number,
    pagination: Pagination
  ): Promise<StoreProcedureOutputResultInterface<any, ChannelOrderListOutputDataModel>> {

    const limitValue = pagination.getLimit();
    const offsetValue = pagination.getOffset();

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_order_for_grpc_v4(?, ?, ?, ? , ?,?, ?, ?, ?,@total_record,@is_have_new_order, @status_code, @message_error);
      SELECT @total_record as total_record, @is_have_new_order AS is_have_new_order,@status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId, branchId, channelOrderFoodId, channelBranchIds, keySearch, +isHaveRestaurantOrder, limitValue, offsetValue]);

    ExceptionStoreProcedure.validate(result);
    
    let data: StoreProcedureOutputResultInterface<any,ChannelOrderListOutputDataModel>=
      new StoreProcedureResultOutput<ChannelOrderListOutputDataModel>().getResultOutputList(result);
      
    return data;

  }

  async spGOrderForGrpc(
    channelOrderId: number,
    channelOrderFoodId: number,
    orderId : string
  ): Promise<any> {


    // console.log('CALL sp_g_order_for_grpc(' + channelOrderId + ',@status_code, @message_error)');

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_order_for_grpc(?,?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [channelOrderId , channelOrderFoodId , orderId]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultDetail(result);

  }

  async spGOrderForGrpcV2(
    channelOrderId: number,
    channelOrderFoodId: number,
    orderId : string
  ): Promise<any> {


    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_order_for_grpc_v2(?,?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [channelOrderId , channelOrderFoodId , orderId]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultDetail(result);

  }


  async spGOrderDataForGrpc(
    channelOrderId: number
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_order_data_for_grpc(?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [channelOrderId]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultDetail(result);

  }

  // async updateChannelOrder(data : ChannelOrderEntity, restaurant_order_id: number): Promise<any> {
  //   data.restaurant_order_id = restaurant_order_id;
  //   data.is_grpc_complete = 0;
  //   await this.channelOrderEntityRepository.update(data.id, data);
  // }

  async updatePrintsByChannelOrderIds(
    ids: any[]
  ): Promise<void> {
    await this.channelOrderPrintEntityRepository.update(
      {
        channel_order_id: In(ids)
      },
      {
        is_printed : 1,
      },
    );
  }

  async updateByRestaurantAndIds(
    restaurantId: number,
    ids: any[]
  ): Promise<void> {
    await this.channelOrderEntityRepository.update(
      {
        id: In(ids),
        restaurant_id: restaurantId,
      },
      {
        is_printed : 1,
      },
    );
  }

  async updateCannelPrintOrders(
    restaurantId: number,
    ids: any[]
  ): Promise<void> {
    await this.channelOrderEntityRepository.update(
      {
        id: In(ids),
        restaurant_id: restaurantId,
      },
      {
        is_cancel_printed : 1,
      },
    );
  }

  async updateCannelPrintsByChannelOrderIds(
    ids: any[]
  ): Promise<void> {
    await this.channelOrderPrintEntityRepository.update(
      {
        channel_order_id: In(ids)
      },
      {
        is_cancel_printed : 1,
      },
    );
  }

  async updateNotifiedByChannelOrderIds (channelOrderIds : number[]) {
    
    await this.channelOrderPrintEntityRepository.update(
      {
        channel_order_id: In(channelOrderIds)
      },
      {
        is_notified : 1,
      },
    );
  }
  
  async updateChannelOrderV2(data : ChannelOrderEntity): Promise<any> {
    await this.channelOrderEntityRepository.update(data.id, data);
  }

  async updateChannelOrderDriver(data : ChannelOrderDriverEntity): Promise<any> {
    await this.channelOrderDriverEntityRepository.update(data.id, data);
  }

  async spUAssignChannelBranch(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    branchMaps: string
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
    CALL sp_u_assign_channel_branch(?, ?, ?, ?, @status_code, @message_error);
    SELECT @status_code as status_code, @message_error as message_error;
  `, [restaurantId, restaurantBrandId, channelOrderFoodId, branchMaps]);

    ExceptionStoreProcedure.validate(result);

  }

  async spUResetToTest(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_u_reset_to_test(?, ?, ? , ?,  @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId , branchId , channelOrderFoodId]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultList(result);

  }

  async spGCheckFoodChannelObject(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelBranchId: string
  ): Promise<foodChannelObjectDataModel> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_check_food_channel_object(?, ?,?,?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId , channelOrderFoodId , channelBranchId]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<foodChannelObjectDataModel>().getResultDetail(result);

  }

  async spGListTokenOfGrabfood(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelBranchId: string
  ): Promise<ChannelFoodTokenGrabfoodDataModel[]> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_token_of_grabfood(?, ?, ? , ? , @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId ,branchId , channelBranchId ]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultList(result);

  }

  // async spURefreshChannelOrderStatus(
  //   restaurantId: number,
  //   restaurantBrandId: number,
  //   branchId : number,
  //   list: string
  // ): Promise<any> {

  //     const result = await this.syncChannelOrdersRepository.query(`
  //     CALL sp_u_refresh_channel_order_status(?, ?, ?, ?, @status_code, @message_error);
  //     SELECT @status_code as status_code, @message_error as message_error;
  //   `, [restaurantId, restaurantBrandId,branchId, list]);

  //   ExceptionStoreProcedure.validate(result);

  // }

  async spGCheckOrderRefresh(
    branchId: number,
    channelOrderRefreshJson: string
  ): Promise<ChannelFoodCheckOrderRefreshDataModel[]> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_check_order_refresh(?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [branchId, channelOrderRefreshJson ]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<ChannelFoodCheckOrderRefreshDataModel>().getResultList(result);

  }

  async spGListChannelOrderByIds(
    restaurantId: number,
    channelOrderIds : string,
  ): Promise<ChannelOrderByIdsDataModel[]> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_channel_order_by_ids(?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, channelOrderIds]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultList(result);

  }

  

  async spGListChannelOrderByIdsV2(
    restaurantId: number,
    channelOrderIds : string,
  ): Promise<ChannelOrderByIdsDataModel[]> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_list_channel_order_by_ids_v2(?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, channelOrderIds]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultList(result);

  }

  async spGChannelOrderById(
    channelOrderId: number,
    isCancel : number,
  ): Promise<ChannelOrderByIdDataModel> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_channel_order_complete_by_id(?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [channelOrderId, isCancel]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<any>().getResultDetail(result);

  }


  async spUUpdateRestaurantOrderIds(
    restaurantId: number,
    channelOrderUpdateJson : string,
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_u_update_restaurant_order_ids(?, ?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, channelOrderUpdateJson]);    

    ExceptionStoreProcedure.validate(result);

  }

  async findOneChannelOrderById(id: number): Promise<ChannelOrderEntity> {    
    return await this.channelOrderEntityRepository.findOne({ where: { id } });;
  }

  async findOneChannelOrderPrintByChannelOrderId(channelOrderId: number): Promise<ChannelOrderPrintEntity> {    
    return await this.channelOrderPrintEntityRepository.findOne({ where: { channel_order_id : channelOrderId } });;
  }

  async findOneChannelOrderDriverByChannelOrderId(channelOrderId: number): Promise<ChannelOrderDriverEntity> {    
    return await this.channelOrderDriverEntityRepository.findOne({ where: { channel_order_id : channelOrderId } });;
  }

  async spUSyncChannelOrderToData(): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_u_sync_channel_order_to_data(@status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `);    

    ExceptionStoreProcedure.validate(result);

  }

  async spGChannelOrderDetailToPrint(
    restaurantId: number,
    channelOrderId: number
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_channel_order_detail_to_print(?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [restaurantId,channelOrderId]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultDetail(result);

  }

  async spGChannelOrderDetailToPrintV2(
    restaurantId: number,
    channelOrderId: number
  ): Promise<any> {

    const result = await this.syncChannelOrdersRepository.query(`
      CALL sp_g_channel_order_detail_to_print_v2(?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [restaurantId,channelOrderId]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultDetail(result);

  }
}
