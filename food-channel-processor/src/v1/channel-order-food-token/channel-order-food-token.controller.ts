import { Controller, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChannelOrderFoodTokenResponse } from './response/channel-order-food-token.response';
import { ChannelOrderFoodTokenService } from './channel-order-food-token.service';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { ChannelOrderFoodService } from '../channel-order-food/channel-order-food.service';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import { ChannelOrderFoodEntity } from '../channel-order-food/entity/channel-order-food.entity';
import { ChannelOrderFoodTokenEntity } from './entity/channel-order-food-token.entity';
import { ChannelOrderFoodApiService } from '../channel-order-food-api/channel-order-food-api.service';
import { ChannelOrderFoodApiType } from 'src/utils.common/utils.enum/utils.channel-order-food-api-type.enum';
import { ChannelOrderFoodType } from 'src/utils.common/utils.enum/utils.channel-order-food-type.enum';
import { GrpcMethod } from '@nestjs/microservices';
import { BranchChannelFoodBranchMapsService } from '../branch-channel-food-branch-map/branch-channel-food-branch-maps.service';
import { Metadata } from '@grpc/grpc-js';
import { RedisService } from 'src/redis/redis.service';
import { ChannelOrderFoodNumberEnum } from 'src/utils.common/utils.enum/utils.channel-order-food-number';

@Controller({
  version: VersionEnum.V1.toString(),
  path: "channel-order-food-token"
})
@ApiBearerAuth()
export class ChannelOrderFoodTokenController {
  constructor(
    private readonly channelOrderFoodTokenService: ChannelOrderFoodTokenService,
    private readonly channelOrderFoodService: ChannelOrderFoodService,
    private readonly channelOrderFoodApiService: ChannelOrderFoodApiService,
    private readonly branchChannelFoodBranchMapsService : BranchChannelFoodBranchMapsService,
    private readonly redisService: RedisService

  ) { }


  @GrpcMethod("ChannelOrderFoodTokenService", "createToken")
  async create(
    createChannelOrderFoodTokenDto: {
          restaurant_id: number,
          restaurant_brand_id: number,
          channel_order_food_id: number,
          access_token : string,
          username: string,
          password : string,
          x_merchant_token : string,
          device_id : string,
          device_brand : string,
          quantity_account : number
    }
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    const isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:create-token-${createChannelOrderFoodTokenDto.restaurant_id}-${createChannelOrderFoodTokenDto.restaurant_brand_id}`,2);

    if(isSpam){
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    let ChannelOrderFood:
      ChannelOrderFoodEntity
      = await this.channelOrderFoodService.findById(createChannelOrderFoodTokenDto.channel_order_food_id);

    if (!ChannelOrderFood) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Id đối tác không tồn tại");
      return response;
    }
    
    let data: any;

    let user_id : number = 0 ;

    let list = await this.channelOrderFoodTokenService.getListByChannelOrderFoodIdAndRestaurantBrand(createChannelOrderFoodTokenDto.restaurant_id , createChannelOrderFoodTokenDto.restaurant_brand_id , createChannelOrderFoodTokenDto.channel_order_food_id);

    if(createChannelOrderFoodTokenDto.channel_order_food_id != ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){

      const isExist = list.some(x => x.username === createChannelOrderFoodTokenDto.username);
      if(isExist){
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Tài khoản này đã được đăng ký . Vui lòng nhập tài khoản khác");
        return response;
        
      }
    }

    if(createChannelOrderFoodTokenDto.quantity_account < (list.length+1)){
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Số lượng tài khoản kết nối đã quá giới hạn cài đặt");
      return response;
    }

    if (ChannelOrderFood.code == ChannelOrderFoodType.SHF) {

      let dataUrlToCheckToken = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(createChannelOrderFoodTokenDto.channel_order_food_id , ChannelOrderFoodApiType.SHF_GET_BRANCH_LIST);
      if (!dataUrlToCheckToken) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataToCheckToken = await this.channelOrderFoodApiService.getBranchesGrpc(dataUrlToCheckToken.url,createChannelOrderFoodTokenDto.access_token,'',createChannelOrderFoodTokenDto.channel_order_food_id);

      if (dataToCheckToken.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Kết nối thất bại, vui lòng kiểm tra lại Token");
        return response;
      }

    }

    if (ChannelOrderFood.code == ChannelOrderFoodType.GRF) {

      let dataUrlLogin = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(createChannelOrderFoodTokenDto.channel_order_food_id, ChannelOrderFoodApiType.GRF_LOGIN);
      if (!dataUrlLogin) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataUrlUpdateDevice = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(createChannelOrderFoodTokenDto.channel_order_food_id, ChannelOrderFoodApiType.GRF_UPDATE_DEVICE_INFO);
      if (!dataUrlUpdateDevice) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataGrpc = await this.channelOrderFoodApiService.checkTokenGrfGrpc(
        dataUrlLogin.url,
        dataUrlUpdateDevice.url,
        createChannelOrderFoodTokenDto.username,
        createChannelOrderFoodTokenDto.password,
        createChannelOrderFoodTokenDto.device_id,
        createChannelOrderFoodTokenDto.device_brand
      )

      if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }
      
      createChannelOrderFoodTokenDto.access_token = dataGrpc.data.access_token;
    }    

    if (ChannelOrderFood.code == ChannelOrderFoodType.BEF) {

      let dataUrlLogin = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(createChannelOrderFoodTokenDto.channel_order_food_id, ChannelOrderFoodApiType.BEF_LOGIN);

      if (!dataUrlLogin) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataGrpc = await this.channelOrderFoodApiService.checkTokenBefGrpc(
        dataUrlLogin.url,
        createChannelOrderFoodTokenDto.username,
        createChannelOrderFoodTokenDto.password
      );

      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }

      createChannelOrderFoodTokenDto.access_token = dataGrpc.data.access_token;
      user_id = dataGrpc.data.user_id;
    }

    
    let channelOrderFoodTokenEntity = new ChannelOrderFoodTokenEntity();
    channelOrderFoodTokenEntity.restaurant_id = createChannelOrderFoodTokenDto.restaurant_id;
    channelOrderFoodTokenEntity.restaurant_brand_id = createChannelOrderFoodTokenDto.restaurant_brand_id;
    channelOrderFoodTokenEntity.channel_order_food_id = createChannelOrderFoodTokenDto.channel_order_food_id
    channelOrderFoodTokenEntity.access_token = createChannelOrderFoodTokenDto.access_token;
    channelOrderFoodTokenEntity.username = createChannelOrderFoodTokenDto.username;
    channelOrderFoodTokenEntity.password = createChannelOrderFoodTokenDto.password;
    channelOrderFoodTokenEntity.x_merchant_token = createChannelOrderFoodTokenDto.x_merchant_token;
    channelOrderFoodTokenEntity.uuid = '';
    channelOrderFoodTokenEntity.menu_group_id = '';
    channelOrderFoodTokenEntity.device_id = createChannelOrderFoodTokenDto.device_id;
    channelOrderFoodTokenEntity.device_brand = createChannelOrderFoodTokenDto.device_brand;
    channelOrderFoodTokenEntity.is_connection = 1 ;
    channelOrderFoodTokenEntity.name = ChannelOrderFood.code + ' '+ (list.length + 1) ;
    channelOrderFoodTokenEntity.user_id = user_id;

    data = await this.channelOrderFoodTokenService.create(channelOrderFoodTokenEntity);

    response.setData(data);

    await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-branches-${createChannelOrderFoodTokenDto.restaurant_id}-${createChannelOrderFoodTokenDto.restaurant_brand_id}`)

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:list-error-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);

    return response;
  }


  @GrpcMethod("ChannelOrderFoodTokenService", "updateToken")
  async update(
    updateChannelOrderFoodTokenDto: {
      id: number,
      restaurant_id : number,
      access_token: string,
      username: string,
      password: string,
      x_merchant_token: string,
      device_id: string,
      device_brand: string
    }
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    const isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:update-token-${updateChannelOrderFoodTokenDto.restaurant_id}-${updateChannelOrderFoodTokenDto.id}`,2);

    if(isSpam){
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    let channelOrderFoodTokenEntity: ChannelOrderFoodTokenEntity
      = await this.channelOrderFoodTokenService.findOne(updateChannelOrderFoodTokenDto.id);

    if (!channelOrderFoodTokenEntity || channelOrderFoodTokenEntity.restaurant_id != updateChannelOrderFoodTokenDto.restaurant_id) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Id token đối tác không tồn tại");
      return response;
    }

    let list = await this.channelOrderFoodTokenService.getListByChannelOrderFoodIdAndRestaurantBrand(channelOrderFoodTokenEntity.restaurant_id , channelOrderFoodTokenEntity.restaurant_brand_id , channelOrderFoodTokenEntity.channel_order_food_id);

    if(channelOrderFoodTokenEntity.channel_order_food_id != ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){

      const isExist = list.some(x => x.username === updateChannelOrderFoodTokenDto.username && x.id != updateChannelOrderFoodTokenDto.id);
      if(isExist){
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Tài khoản này đã được đăng ký . Vui lòng nhập tài khoản khác");
        return response;
      }
    }
    
    if (channelOrderFoodTokenEntity.channel_order_food_id == 1) {

      let dataUrlToCheckToken = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(channelOrderFoodTokenEntity.channel_order_food_id , ChannelOrderFoodApiType.SHF_GET_BRANCH_LIST);
      if (!dataUrlToCheckToken) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataToCheckToken = await this.channelOrderFoodApiService.getBranchesGrpc(dataUrlToCheckToken.url,updateChannelOrderFoodTokenDto.access_token,'',channelOrderFoodTokenEntity.channel_order_food_id);

      if (dataToCheckToken.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Kết nối thất bại, vui lòng kiểm tra lại Token");
        return response;
      }

    }

    if (channelOrderFoodTokenEntity.channel_order_food_id == 2) {

      let dataUrlLogin = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(channelOrderFoodTokenEntity.channel_order_food_id, ChannelOrderFoodApiType.GRF_LOGIN);
      if (!dataUrlLogin) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataUrlUpdateDevice = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(channelOrderFoodTokenEntity.channel_order_food_id, ChannelOrderFoodApiType.GRF_UPDATE_DEVICE_INFO);
      if (!dataUrlUpdateDevice) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataGrpc = await this.channelOrderFoodApiService.checkTokenGrfGrpc(
        dataUrlLogin.url,
        dataUrlUpdateDevice.url,
        updateChannelOrderFoodTokenDto.username,
        updateChannelOrderFoodTokenDto.password,
        updateChannelOrderFoodTokenDto.device_id,
        updateChannelOrderFoodTokenDto.device_brand
      )

      if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }
      
      updateChannelOrderFoodTokenDto.access_token = dataGrpc.data.access_token;
    }    

    let user_id : number = 0 ;

    if (channelOrderFoodTokenEntity.channel_order_food_id == 4) {

      let dataUrlLogin = await this.channelOrderFoodApiService.findBychannelOrderFoodIdAndType(channelOrderFoodTokenEntity.channel_order_food_id, ChannelOrderFoodApiType.BEF_LOGIN);

      if (!dataUrlLogin) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Hệ thống chưa có thông tin kết nối với đối tác này");
        return response;
      }

      let dataGrpc = await this.channelOrderFoodApiService.checkTokenBefGrpc(
        dataUrlLogin.url,
        updateChannelOrderFoodTokenDto.username,
        updateChannelOrderFoodTokenDto.password
      );

      if (dataGrpc.status != HttpStatus.OK) {
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return response;
      }

      updateChannelOrderFoodTokenDto.access_token = dataGrpc.data.access_token;
      user_id = dataGrpc.data.user_id;

    }

    channelOrderFoodTokenEntity.access_token = updateChannelOrderFoodTokenDto.access_token;
    channelOrderFoodTokenEntity.username = updateChannelOrderFoodTokenDto.username;
    channelOrderFoodTokenEntity.password = updateChannelOrderFoodTokenDto.password;
    channelOrderFoodTokenEntity.x_merchant_token = updateChannelOrderFoodTokenDto.x_merchant_token;
    channelOrderFoodTokenEntity.device_id = updateChannelOrderFoodTokenDto.device_id;
    channelOrderFoodTokenEntity.device_brand = updateChannelOrderFoodTokenDto.device_brand;
    channelOrderFoodTokenEntity.user_id = user_id;
    
    let data = await this.channelOrderFoodTokenService.update(updateChannelOrderFoodTokenDto.id, channelOrderFoodTokenEntity);

    response.setData(data);

    await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-branches-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`)

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:list-error-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);


    return response;  
  }

  @GrpcMethod("ChannelOrderFoodTokenService", "changeConnection")
  async changeConnection(
    updateChannelOrderFoodTokenDto: {
      id: number,
      quantity_account : number
    },
    metadata: Metadata
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    const isSpam = await this.redisService.checkSpamByRedis(`food_channel_processor:change-connection-token-${updateChannelOrderFoodTokenDto.id}`,2);

    if(isSpam){
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS);
      response.setMessageError("Bạn đang thao tác quá nhanh.Vui lòng thử lại sau vài giây.");
      return response;
    }

    let channelOrderFoodTokenEntity: ChannelOrderFoodTokenEntity
      = await this.channelOrderFoodTokenService.findOne(updateChannelOrderFoodTokenDto.id);

      let a: string = metadata.getMap()["user"].toString();
      
      const restaurantId = JSON.parse(Buffer.from(a, "base64").toString("utf-8")).restaurant_id;
               
      if (!channelOrderFoodTokenEntity || restaurantId != channelOrderFoodTokenEntity.restaurant_id) {
             response.setStatus(HttpStatus.BAD_REQUEST);
             response.setMessageError("Id tài khoản đối tác không tồn tại");
             return response;
      }
      
    channelOrderFoodTokenEntity.is_connection = channelOrderFoodTokenEntity.is_connection === 1 ? 0 : 1 ; 

    if(channelOrderFoodTokenEntity.is_connection === 1){

      let list = await this.channelOrderFoodTokenService.getListByChannelOrderFoodIdAndRestaurantBrand(channelOrderFoodTokenEntity.restaurant_id , channelOrderFoodTokenEntity.restaurant_brand_id , channelOrderFoodTokenEntity.channel_order_food_id);

      if(updateChannelOrderFoodTokenDto.quantity_account < (list.filter(item => item.is_connection === 1).length+1)){
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Số lượng tài khoản kết nối đã quá giới hạn cài đặt");
        return response;
      }
    }
    else{


      channelOrderFoodTokenEntity.access_token = '';
      channelOrderFoodTokenEntity.username= '';
      channelOrderFoodTokenEntity.password='';
      channelOrderFoodTokenEntity.x_merchant_token='';


      let dataGrpc = await this.branchChannelFoodBranchMapsService.updateBranchMapWhenUnconnectionTokenGrpc(channelOrderFoodTokenEntity.restaurant_id , channelOrderFoodTokenEntity.restaurant_brand_id , channelOrderFoodTokenEntity.channel_order_food_id , channelOrderFoodTokenEntity.id);
          
        if(dataGrpc.status != HttpStatus.OK){
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        await this.branchChannelFoodBranchMapsService.updateBranchMapWhenUnconnectionToken(channelOrderFoodTokenEntity.restaurant_id , channelOrderFoodTokenEntity.restaurant_brand_id , channelOrderFoodTokenEntity.channel_order_food_id , channelOrderFoodTokenEntity.id);

    }

    let data = await this.channelOrderFoodTokenService.update(updateChannelOrderFoodTokenDto.id, channelOrderFoodTokenEntity);

    response.setData(data);

    await this.redisService.deleteKeysWithPrefix(`food_channel:validator-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:get-channel-branches-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`)

    await this.redisService.deleteKeysWithPrefix(`food_channel_processor:list-error-${channelOrderFoodTokenEntity.restaurant_id}-${channelOrderFoodTokenEntity.restaurant_brand_id}`);

    console.log(`tài khoản có id là ${channelOrderFoodTokenEntity.id} đã được thay đổi trạng thái kết nối`);
    

    return response;  
  }

  @GrpcMethod("ChannelOrderFoodTokenService", "findByIdToken")
  async findOne(
    param :{id : number}
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    const data = await this.channelOrderFoodTokenService.findOne(param.id);

    if (!data) {
      response.setStatus(HttpStatus.BAD_REQUEST);
      response.setMessageError("Id token đối tác không tồn tại");
      return response ;   
    }

    response.setData(new ChannelOrderFoodTokenResponse(data));

    return response;  
  }

  @GrpcMethod("ChannelOrderFoodTokenService", "getList")
  async getList(
    param :{
      restaurant_id: number,
      restaurant_brand_id: number,
      channel_order_food_id: number,
      channel_order_food_token_id: number,
      is_connection : number
    }
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    const data = await this.channelOrderFoodTokenService.spGListChannelOrderFoodToken(
      param.restaurant_id ,
      param.restaurant_brand_id,
      param.channel_order_food_id,
      param.channel_order_food_token_id,
      param.is_connection
    )

    response.setData(data);

    return response;  
  }

}
