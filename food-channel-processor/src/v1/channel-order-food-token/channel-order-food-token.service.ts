import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelOrderFoodTokenEntity } from './entity/channel-order-food-token.entity';
import { ExceptionStoreProcedure } from 'src/utils.common/utils.exception.common/utils.store-procedure-exception.common';
import { StoreProcedureResult } from 'src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common';
import { InfoTokenToComfirmChannelOrderDataModel } from './model/info-token-to-comfirm-channel-order.data.model';

@Injectable()
export class ChannelOrderFoodTokenService {
  constructor(
    @InjectRepository(ChannelOrderFoodTokenEntity)
    private readonly channelOrderFoodTokenRepository: Repository<ChannelOrderFoodTokenEntity>,
  ) {}

  async create(dto: ChannelOrderFoodTokenEntity): Promise<ChannelOrderFoodTokenEntity> {
    const entity = this.channelOrderFoodTokenRepository.create(dto);
    return this.channelOrderFoodTokenRepository.save(entity);
  }

  async update(id: number, dto: ChannelOrderFoodTokenEntity): Promise<ChannelOrderFoodTokenEntity> {
    await this.channelOrderFoodTokenRepository.update(id, dto);
    return this.channelOrderFoodTokenRepository.findOneBy({id});
  }

  async updateTokenGRF(id: number, access_token : string , device_id : string , device_brand : string ): Promise<ChannelOrderFoodTokenEntity> {
    let data = await this.channelOrderFoodTokenRepository.findOneBy({id});
    data.access_token = access_token;
    
    await this.channelOrderFoodTokenRepository.update(id, data);
    return data ;        
  }

  async updateUnconnectionToken(id: number): Promise<any> {
    let data = await this.channelOrderFoodTokenRepository.findOneBy({id});
    data.is_connection = 0;
    
    await this.channelOrderFoodTokenRepository.update(id, data);
  }

  async updateTokenBEF(id: number, access_token : string ): Promise<ChannelOrderFoodTokenEntity> {
    let data = await this.channelOrderFoodTokenRepository.findOneBy({id});
    data.access_token = access_token;
    await this.channelOrderFoodTokenRepository.update(id, data);
    return data;
  }

  async findAll(): Promise<ChannelOrderFoodTokenEntity[]> {
    return this.channelOrderFoodTokenRepository.find();
  }

  async findOne(id: number): Promise<ChannelOrderFoodTokenEntity> {
    return this.channelOrderFoodTokenRepository.findOneById(id);
  }

  async remove(id: number): Promise<void> {
    await this.channelOrderFoodTokenRepository.delete(id);
  }

  async findByChannelOrderFoodIdAndRestaurantBrand( restaurant_id: number , restaurant_brand_id: number , channel_order_food_id: number): Promise<ChannelOrderFoodTokenEntity> {
    return await this.channelOrderFoodTokenRepository.findOne({
      where: {
        restaurant_id,
        restaurant_brand_id,
        channel_order_food_id,
      },
    });
  }


  async getListByChannelOrderFoodIdAndRestaurantBrand( restaurant_id: number , restaurant_brand_id: number , channel_order_food_id: number): Promise<ChannelOrderFoodTokenEntity[]> {
    return await this.channelOrderFoodTokenRepository.find({
      where: {
        restaurant_id,
        restaurant_brand_id,
        channel_order_food_id,
      },
    });
  }

  async findByTokenGRF( restaurant_id: number , restaurant_brand_id: number , channel_order_food_id: number , username : string ): Promise<ChannelOrderFoodTokenEntity> {
    return await this.channelOrderFoodTokenRepository.findOne({
      where: {
        restaurant_id,
        restaurant_brand_id,
        channel_order_food_id,
        username
      },
    });
  }

  async getListTokenGRFByRestaurantBrand(
    restaurant_id: number,
    restaurant_brand_id: number,
    channel_order_food_id: number
  ): Promise<ChannelOrderFoodTokenEntity[]> {
    return await this.channelOrderFoodTokenRepository.find({
      where: {
        restaurant_id: restaurant_id,
        restaurant_brand_id: restaurant_brand_id,
        channel_order_food_id: channel_order_food_id
      }
    });
  }

  async spGListChannelOrderFoodToken(
    restaurantId: number,
    restaurantBrandId: number,
    channelOrderFoodId: number,
    channelOrderFoodTokenId: number,
    isConnection : number

  ): Promise<any[]> {

    const result = await this.channelOrderFoodTokenRepository.query(`
      CALL sp_g_list_channel_order_food_token(?,?,?,?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [restaurantId ,restaurantBrandId ,channelOrderFoodId,channelOrderFoodTokenId,isConnection ]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultList(result);

  }

  async spUUpdateReconnectionTokens(
    tokens : string

  ): Promise<any> {

    const result = await this.channelOrderFoodTokenRepository.query(`
      CALL sp_u_update_reconnection_tokens(?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [tokens]);

    ExceptionStoreProcedure.validate(result);       

  }

  async spGCheckSettingFoodChannelRestaurantBrand(
    restaurantId: number,
    restaurantBrandId: number,
    quantityAccountSHF: number,
    quantityAccountGRF: number,
    quantityAccountBEF : number

  ): Promise<any[]> {

    const result = await this.channelOrderFoodTokenRepository.query(`
      CALL sp_g_check_setting_food_channel_restaurant_brand(?,?,?,?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [restaurantId ,restaurantBrandId ,quantityAccountSHF,quantityAccountGRF,quantityAccountBEF ]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<any>().getResultList(result);
  }

  async spUUpdateSettingFoodChannelRestaurantBrand(
    channelOrderFoodTokenIds : string

  ): Promise<any> {

    const result = await this.channelOrderFoodTokenRepository.query(`
      CALL sp_u_update_setting_food_channel_restaurant_brand(?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [channelOrderFoodTokenIds]);

    ExceptionStoreProcedure.validate(result);    

  }

  async spGInfoTokenToComfirmChannelOrder(
    restaurantId: number,
    restaurantBrandId: number,
    branchId:number,
    channelOrderFoodId: number,
    channelOrderFoodTokenId:number,
    channelBranchId: string
  ): Promise<InfoTokenToComfirmChannelOrderDataModel> {

    const result = await this.channelOrderFoodTokenRepository.query(`
      CALL sp_g_info_token_to_comfirm_channel_order(?, ?,?,?,?,?, @status_code, @message_error);
      SELECT @status_code as status_code, @message_error as message_error;
    `, [restaurantId, restaurantBrandId ,branchId,  channelOrderFoodId ,channelOrderFoodTokenId, channelBranchId]);

    ExceptionStoreProcedure.validate(result);

    return new StoreProcedureResult<InfoTokenToComfirmChannelOrderDataModel>().getResultDetail(result);

  }

  async getlistTokenError( restaurant_id: number , restaurant_brand_id: number): Promise<any> {
    const data = await this.channelOrderFoodTokenRepository.findBy({
      restaurant_id,
      restaurant_brand_id,
      access_token : 'token_expired',
      is_connection : 1
    });

    return data.map((x) => ({
      code : x.channel_order_food_id,
      message : `Tài khoản ${x.name} có username là ${x.username} đã hết hiệu lực . Vui lòng kết nối lại tài khoản`,
      token_name : x.name,
      token_username : x.username
    }));
  }
}
