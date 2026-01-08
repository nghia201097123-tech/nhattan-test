
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchChannelFoodBranchMapEntity } from './entity/branch-channel-food-branch-maps.entity';
import { grpcClientDashboard } from '../grpc/client/dashboard-client-option';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { BaseResponse, BranchChannelFoodBranchMapServiceClient } from '../grpc/interfaces/branch-channel-food-branch-map';
import { catchError, defaultIfEmpty, lastValueFrom, retry , throwError, timer } from 'rxjs';
import { ExceptionStoreProcedure } from 'src/utils.common/utils.exception.common/utils.store-procedure-exception.common';
import { StoreProcedureResult } from 'src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common';
import { CheckSettingBranchMapDataModel } from './model/check-setting-branch-map.data.model';

@Injectable()
export class BranchChannelFoodBranchMapsService {

  @Client(grpcClientDashboard)
  private readonly grpcClientDashboard: ClientGrpc;

  private branchChannelFoodBranchMapService: BranchChannelFoodBranchMapServiceClient;

  
  constructor(
    @InjectRepository(BranchChannelFoodBranchMapEntity)
    private branchChannelFoodBranchMapsRepository: Repository<BranchChannelFoodBranchMapEntity>,
  ) { }

  onModuleInit() {
    this.branchChannelFoodBranchMapService = this.grpcClientDashboard.getService<BranchChannelFoodBranchMapServiceClient>('BranchChannelFoodBranchMapService');
  }

  findAll(): Promise<BranchChannelFoodBranchMapEntity[]> {
    return this.branchChannelFoodBranchMapsRepository.find();
  }

  findOne(id: number): Promise<BranchChannelFoodBranchMapEntity> {
    return this.branchChannelFoodBranchMapsRepository.findOneBy({ id });
  }

  create(branchChannelFoodBranchMap: BranchChannelFoodBranchMapEntity): Promise<BranchChannelFoodBranchMapEntity> {
    return this.branchChannelFoodBranchMapsRepository.save(branchChannelFoodBranchMap);
  }

  async updateBranchMapWhenUnconnection( restaurantId : number ,restaurantBrandId : number , channelOrderFoodId : number): Promise<any> {
    let list =  await this.branchChannelFoodBranchMapsRepository.find({
      where: {
        restaurant_id : restaurantId,
        restaurant_brand_id : restaurantBrandId ,
        channel_order_food_id : channelOrderFoodId
      },
    });

    for (const data of list) {
      await this.branchChannelFoodBranchMapsRepository.delete(data.id);
    }
  }

  async updateBranchMapWhenUnconnectionToken( restaurantId : number ,restaurantBrandId : number , channelOrderFoodId : number ,  channelOrderFoodTokenId : number
  ): Promise<any> {
    let list =  await this.branchChannelFoodBranchMapsRepository.find({
      where: {
        restaurant_id : restaurantId,
        restaurant_brand_id : restaurantBrandId ,
        channel_order_food_id : channelOrderFoodId,
        channel_order_food_token_id : channelOrderFoodTokenId
      },
    });

    for (const data of list) {
      await this.branchChannelFoodBranchMapsRepository.delete(data.id);
    }
  }
  
  async spUBranchInformationsForBEF(
    branchJsons: string
  ): Promise<any> {

    const result = await this.branchChannelFoodBranchMapsRepository.query(`
    CALL sp_u_branch_informations_for_BEF(?,@status_code, @message_error);
    SELECT @status_code as status_code, @message_error as message_error;
  `, [branchJsons]);

    ExceptionStoreProcedure.validate(result);
  }

  async updateBranchMapWhenUnconnectionGrpc(restaurantId : number ,restaurantBrandId : number , channelOrderFoodId : number): Promise<BaseResponse> {
  try {

    let data = await lastValueFrom(this.branchChannelFoodBranchMapService.updateBranchMapWhenUnconnection(
      {
        restaurant_id : restaurantId ,
        restaurant_brand_id : restaurantBrandId , 
        channel_order_food_id : channelOrderFoodId
      })
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty( {
          status: 400,
          message: "Error during gRPC call",
          data: {}
        }),        catchError((err) => {
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

  async updateBranchMapWhenUnconnectionTokenGrpc(
    restaurantId : number ,
    restaurantBrandId : number , 
    channelOrderFoodId : number,
    channelOrderFoodTokenId : number
  ): Promise<BaseResponse> {
    try {
  
      let data = await lastValueFrom(this.branchChannelFoodBranchMapService.updateBranchMapWhenUnconnectionToken(
        {
          restaurant_id : restaurantId ,
          restaurant_brand_id : restaurantBrandId , 
          channel_order_food_id : channelOrderFoodId,
          channel_order_food_token_id : channelOrderFoodTokenId
        }
        ).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
              return timer(retryCount * 1000);
            },
          }),
          defaultIfEmpty( {
            status: 400,
            message: "Error during gRPC call",
            data: {}
          }),        catchError((err) => {
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

  async spUAssignMultipleChannelBranch(
    restaurantId: number,
    restaurantBrandId: number,
    branchId:number,
    channelOrderFoodId: number,
    branchMaps: string
  ): Promise<any> {

    const result = await this.branchChannelFoodBranchMapsRepository.query(`
    CALL sp_u_assign_multiple_channel_branch(?, ?, ?, ?,?, @status_code, @message_error);
    SELECT @status_code as status_code, @message_error as message_error;
  `, [restaurantId, restaurantBrandId,branchId, channelOrderFoodId, branchMaps]);

    ExceptionStoreProcedure.validate(result);

  }

  async spGCheckSettingBranchMaps(
    branchId: number,
    quantiySlotSHF: number,
    quantiySlotGRF:number,
    quantiySlotBEF: number,
  ): Promise<CheckSettingBranchMapDataModel[]> {

    const result = await this.branchChannelFoodBranchMapsRepository.query(`
    CALL sp_g_check_setting_branch_maps(?, ?, ?, ?, @status_code, @message_error);
    SELECT @status_code as status_code, @message_error as message_error;
  `, [branchId, quantiySlotSHF,quantiySlotGRF, quantiySlotBEF]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<CheckSettingBranchMapDataModel>().getResultList(result);
  }

  async spUUpdateSettingBranch(
    branchId: number,
    listRemoveJson: string 
  ): Promise<any> {

    const result = await this.branchChannelFoodBranchMapsRepository.query(`
    CALL sp_u_update_setting_branch(?, ?, @status_code, @message_error);
    SELECT @status_code as status_code, @message_error as message_error;
  `, [branchId, listRemoveJson]);

    ExceptionStoreProcedure.validate(result);

  }

  async updateSettingBranchGrpc(
      branchId: number,
      listRemoveJson: string 
  ): Promise<BaseResponse> {
    try {
  
      let data = await lastValueFrom(this.branchChannelFoodBranchMapService.updateSettingBranch(
        {
          branch_id : branchId ,
          list_remove : listRemoveJson 
        }
      ).pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
            return timer(retryCount * 1000);
          },
        }),
        defaultIfEmpty( {
          status: 400,
          message: "Error during gRPC call",
          data: {}
        }),        catchError((err) => {
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

  async updateSettingFoodChannelRestaurantBrandGrpc(
    channelOrderFoodTokenIds: string 
): Promise<BaseResponse> {
  try {

    let data = await lastValueFrom(this.branchChannelFoodBranchMapService.updateSettingFoodChannelRestaurantBrand(
      {
        channel_order_food_token_ids : channelOrderFoodTokenIds 
      }
    ).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.error(`Error encountered during gRPC call (attempt ${retryCount}):`, error);
          return timer(retryCount * 1000);
        },
      }),
      defaultIfEmpty( {
        status: 400,
        message: "Error during gRPC call",
        data: {}
      }),        catchError((err) => {
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
}
