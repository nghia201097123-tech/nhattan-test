import {
    Controller,
    Post,
    Body,
    HttpStatus,
    Res,
    Get,
    Query,
  } from '@nestjs/common';
import { Response } from 'express';

import { BranchChannelFoodCommissionPercentMapService } from './branch-channel-food-commission-percent-map.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import { SettingCommissionPercentDto } from './dto/setting-commission-percent.dto';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { GetUser } from 'src/utils.common/utils.decorator.common/utils.decorator.common';
import { UserValidateToken } from 'src/utils.common/utils.middleware.common/user-validate-token';
  
@Controller({
    version: VersionEnum.V5.toString(),
    path: "branch-channel-food-commission-percent-maps"
  })
  @ApiBearerAuth()
  export class BranchChannelFoodCommissionPercentMapController {
    constructor(
      private readonly branchChannelFoodCommissionPercentMapService: BranchChannelFoodCommissionPercentMapService
    ) {}
  
    @Post('/setting')
    @ApiOperation({ summary: 'Thêm token cho đối tác' })
    @ApiResponse({ status: 200, description: 'Successful' })
    async setting(
    @Body() settingCommissionPercentDto: SettingCommissionPercentDto,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
    ): Promise<any> {

    let response: ResponseData = new ResponseData();

    let data = await this.branchChannelFoodCommissionPercentMapService.updateSettingCommissionPercentGrpc(
      settingCommissionPercentDto.id,
      user.restaurant_id,
      settingCommissionPercentDto.restaurant_brand_id,
      settingCommissionPercentDto.branch_id,
      settingCommissionPercentDto.channel_order_food_id,
      settingCommissionPercentDto.percent,
      settingCommissionPercentDto.channel_order_food_token_id
    );
      
    if(data.status != HttpStatus.OK){
      response.setStatus(data.status);
      response.setMessageError(data.message);
      return res.status(HttpStatus.OK).send(response);
    }

    response.setData(data.data);

    return res.status(HttpStatus.OK).send(response);
    }

    @Get("/list")
    @ApiOperation({ summary: "Lấy danh sách cài đặt chi phí chiết khấu" })
    @ApiResponse({ status: 200, description: 'Successful operation' })
    @ApiQuery({ name: 'restaurant_brand_id', required: true, type: Number, description: 'Id thương hiệu' })
    @ApiQuery({ name: 'branch_id', required: true, type: Number, description: 'Id chi nhánh' })
    @ApiQuery({ name: 'channel_order_food_id', required: false, type: Number, description: 'Id đối tác' })
    @ApiQuery({ name: 'channel_order_food_token_id', required: false, type: Number, description: 'Id tài khoản' })
    async getList(
        @Query("restaurant_brand_id") restaurantBrandId: number = 0,
        @Query("branch_id") branchId: number = 0,
        @Query("channel_order_food_id") channelOrderFoodId: number = -1,
        @Query("channel_order_food_token_id") channelOrderFoodTokenId: number = -1,
        @GetUser() user: UserValidateToken,
        @Res() res: Response
    ): Promise<any> {
        let response: ResponseData = new ResponseData();
        
        let  data = await this.branchChannelFoodCommissionPercentMapService.getListCommissionPercentSettingV2Grpc
        (user.restaurant_id ,restaurantBrandId , branchId , channelOrderFoodId , channelOrderFoodTokenId);

        if(data.status != HttpStatus.OK){
          response.setStatus(data.status);
          response.setMessageError(data.message);
          return res.status(HttpStatus.OK).send(response);
        }
    
        response.setData(data?.data?? []);

        return res.status(HttpStatus.OK).send(response);
    }

}
  