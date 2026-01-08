import {
    Controller,
    HttpStatus,
  } from '@nestjs/common';

import { BranchChannelFoodCommissionPercentMapService } from './branch-channel-food-commission-percent-map.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { ChannelOrderFoodEntity } from '../channel-order-food/entity/channel-order-food.entity';
import { ChannelOrderFoodService } from '../channel-order-food/channel-order-food.service';
import { BranchChannelFoodCommissionPercentMapEntity } from './entity/branch-channel-food-commission-percent-map.entity';
import { ChannelOrderFoodTokenService } from '../channel-order-food-token/channel-order-food-token.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CommissionPercentSettingV2DataModel } from './model/commission-percent-setting-v2.model.data';
  
@Controller({
    version: VersionEnum.V1.toString(),
    path: "branch-channel-food-commission-percent-maps"
  })
  @ApiBearerAuth()
  export class BranchChannelFoodCommissionPercentMapController {
    constructor(
      private readonly branchChannelFoodCommissionPercentMapService: BranchChannelFoodCommissionPercentMapService,
      private readonly channelOrderFoodService: ChannelOrderFoodService,
      private readonly channelOrderFoodTokenService: ChannelOrderFoodTokenService,
    ) {}
  
    @GrpcMethod("SettingCommissionService", "updateSettingCommissionPercent")
    async setting(
        settingCommissionPercentDto:{
            id: number,
            restaurant_id: number,
            restaurant_brand_id: number,
            branch_id: number,
            channel_order_food_id: number,
            percent: number,
            channel_order_food_token_id : number
        }
    ): Promise<any> {

    let response: ResponseData = new ResponseData();
    let data: any;

    if(settingCommissionPercentDto.id == 0){

        let ChannelOrderFood:
        ChannelOrderFoodEntity
        = await this.channelOrderFoodService.findById(settingCommissionPercentDto.channel_order_food_id);

        if (!ChannelOrderFood) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError("Id đối tác không tồn tại");
            return response;
        }

        let tokenToCheck = await this.channelOrderFoodTokenService.findOne(settingCommissionPercentDto.channel_order_food_token_id);

        if (!tokenToCheck) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError("Tài khoản cài đặt chiết khấu không hợp lệ");
            return response;
        }

        let branchChannelFoodCommissionPercentMapEntity : BranchChannelFoodCommissionPercentMapEntity = await this.branchChannelFoodCommissionPercentMapService.checkExist(
            settingCommissionPercentDto.restaurant_id , settingCommissionPercentDto.restaurant_brand_id , settingCommissionPercentDto.branch_id , settingCommissionPercentDto.channel_order_food_id , settingCommissionPercentDto.channel_order_food_token_id
        );

        if(!branchChannelFoodCommissionPercentMapEntity){

            branchChannelFoodCommissionPercentMapEntity = new BranchChannelFoodCommissionPercentMapEntity();
            branchChannelFoodCommissionPercentMapEntity.restaurant_id = +settingCommissionPercentDto.restaurant_id;
            branchChannelFoodCommissionPercentMapEntity.restaurant_brand_id = +settingCommissionPercentDto.restaurant_brand_id;
            branchChannelFoodCommissionPercentMapEntity.branch_id = +settingCommissionPercentDto.branch_id;
            branchChannelFoodCommissionPercentMapEntity.channel_order_food_id = +settingCommissionPercentDto.channel_order_food_id;
            branchChannelFoodCommissionPercentMapEntity.channel_order_food_id = +settingCommissionPercentDto.channel_order_food_id;
            branchChannelFoodCommissionPercentMapEntity.channel_order_food_token_id = +settingCommissionPercentDto.channel_order_food_token_id;
            branchChannelFoodCommissionPercentMapEntity.channel_branch_id = '';

            branchChannelFoodCommissionPercentMapEntity.percent = +settingCommissionPercentDto.percent ; 

            data = await this.branchChannelFoodCommissionPercentMapService.create(branchChannelFoodCommissionPercentMapEntity);
        }else{
            branchChannelFoodCommissionPercentMapEntity.percent = +settingCommissionPercentDto.percent ; 
            data = await this.branchChannelFoodCommissionPercentMapService.update(branchChannelFoodCommissionPercentMapEntity.id, branchChannelFoodCommissionPercentMapEntity);
        }
    }else{
        let branchChannelFoodCommissionPercentMapEntity : BranchChannelFoodCommissionPercentMapEntity = await this.branchChannelFoodCommissionPercentMapService.findOne(settingCommissionPercentDto.id)
        if (!branchChannelFoodCommissionPercentMapEntity) {
            response.setStatus(HttpStatus.BAD_REQUEST);
            response.setMessageError("Cập nhập chiết khấu thất bại");
            return response;
        }
        branchChannelFoodCommissionPercentMapEntity.percent = +settingCommissionPercentDto.percent ; 
        data = await this.branchChannelFoodCommissionPercentMapService.update(branchChannelFoodCommissionPercentMapEntity.id, branchChannelFoodCommissionPercentMapEntity);

    }

    response.setData(data);

    return response;
    }

    @GrpcMethod("SettingCommissionService", "getListCommissionPercentSettingV2")
    async getListV2(
            queryData:{
                restaurant_id: number,
                restaurant_brand_id: number,
                branch_id : number,
                channel_order_food_id : number,
                channel_order_food_token_id : number
            }
    ): Promise<any> {
        let response: ResponseData = new ResponseData();
        
        const data : CommissionPercentSettingV2DataModel[] = await this.branchChannelFoodCommissionPercentMapService.spGListCommissionPercentSettingV2(
                        queryData.restaurant_id , 
                        queryData.restaurant_brand_id,
                        queryData.branch_id,
                        queryData.channel_order_food_id,
                        queryData.channel_order_food_token_id
                    );

        response.setData(data);
        return response;
    }

}
  