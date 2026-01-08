import { Controller, Get, Post, Body, Param, Res, HttpStatus, Query, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ChannelOrderFoodTokenService } from './channel-order-food-token.service';
import { CreateChannelOrderFoodTokenDto } from './dto/create-channel-order-food-token.dto';
import { UpdateChannelOrderFoodTokenDto } from './dto/update-channel-order-food-token.dto';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import { GetUser } from 'src/utils.common/utils.decorator.common/utils.decorator.common';
import { UserValidateToken } from 'src/utils.common/utils.middleware.common/user-validate-token';
import { ChangeConnectionChannelOrderFoodTokenDto } from './dto/change-conection-channel-order-food-token.dto copy';
import { AddGrpcMetadata } from 'src/utils.common/utils.decode-token.common/add-grpc-metadata.decorator';
import { Metadata } from '@grpc/grpc-js';

@Controller({
  version: VersionEnum.V3.toString(),
  path: "channel-order-food-token"
})
@ApiBearerAuth()
export class ChannelOrderFoodTokenController {
  constructor(
    private readonly channelOrderFoodTokenService: ChannelOrderFoodTokenService,
  ) { }


  @Post('/create')
  @ApiOperation({ summary: 'Thêm token cho đối tác' })
  @ApiResponse({ status: 200, description: 'Successful' })
  async create(
    @Body() createChannelOrderFoodTokenDto: CreateChannelOrderFoodTokenDto,
    @GetUser() user : UserValidateToken,
    @Res() res: Response
  ): Promise<any> {
    
    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodTokenService.createTokenGrpc(
        user.restaurant_id,
        createChannelOrderFoodTokenDto.restaurant_brand_id,
        createChannelOrderFoodTokenDto.channel_order_food_id,
        createChannelOrderFoodTokenDto.access_token,
        createChannelOrderFoodTokenDto.username,
        createChannelOrderFoodTokenDto.password,
        createChannelOrderFoodTokenDto.x_merchant_token,
        createChannelOrderFoodTokenDto.device_id,
        createChannelOrderFoodTokenDto.device_brand,
        createChannelOrderFoodTokenDto.quantity_account
    )

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
      }
  
      response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }

  @Post('/update/:id')
  @ApiOperation({ summary: 'Cập nhật token đối tác' })
  @ApiResponse({ status: 200, description: 'Successful' })
  async update(
    @Param('id') id: number,
    @Body() updateChannelOrderFoodTokenDto: UpdateChannelOrderFoodTokenDto,
    @GetUser() user : UserValidateToken,
    @Res() res: Response
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    
    let dataGrpc = await this.channelOrderFoodTokenService.updateTokenGrpc(
        id,
        user.restaurant_id,
        updateChannelOrderFoodTokenDto.access_token,
        updateChannelOrderFoodTokenDto.username,
        updateChannelOrderFoodTokenDto.password,
        updateChannelOrderFoodTokenDto.x_merchant_token,
        updateChannelOrderFoodTokenDto.device_id,
        updateChannelOrderFoodTokenDto.device_brand
    )

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
    }
  
    response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }

  @Post('/change-connection/:id')
  @ApiOperation({ summary: 'Bật/Tắt kết nối token đối tác' })
  @ApiResponse({ status: 200, description: 'Successful' })
  async changeConnection(
    @Param('id') id: number,
    @Body() changeConnectionChannelOrderFoodTokenDto: ChangeConnectionChannelOrderFoodTokenDto,
    @Res() res: Response,
    @GetUser() user: UserValidateToken,
    @AddGrpcMetadata() metadata: Metadata
  ): Promise<any> {

    let response: ResponseData = new ResponseData();

    
    let dataGrpc = await this.channelOrderFoodTokenService.changeConnectionGrpc(
        id,
        changeConnectionChannelOrderFoodTokenDto.quantity_account,
        metadata
    )

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }

  @Get('/:id/detail')
  @ApiOperation({ summary: 'Lấy thông tin đối tác tích hợp' })
  @ApiResponse({ status: 200, description: 'Successful' })
  async findOne(
    @Param('id') id: number = 0,
    @Res() res: Response
    ): Promise<any> {

    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodTokenService.findByIdTokenGrpc(id);

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc.data);

    return res.status(HttpStatus.OK).send(response);
  }


  @Get('/list')
  @ApiOperation({ summary: 'Lấy thông tin đối tác tích hợp' })
  @ApiResponse({ status: 200, description: 'Successful' })
  @ApiQuery({ name: 'restaurant_brand_id', required: true, type: Number, description: 'Id thương hiệu' })
  @ApiQuery({ name: 'channel_order_food_id', required: false, type: Number, description: 'Id đối tác' })
  @ApiQuery({ name: 'channel_order_food_token_id', required: false, type: Number, description: 'Id tài khoản' })
  @ApiQuery({ name: 'is_connection', required: false, type: Number, description: 'Id tài khoản' })
  async getList(
    @Query("restaurant_brand_id") restaurantBrandId: number = 0,
    @Query("channel_order_food_id") channelOrderFoodId: number = -1,
    @Query("channel_order_food_token_id") channelOrderFoodTokenId: number = -1,
    @Query("is_connection") isConnection: number = -1,
    @GetUser() user: UserValidateToken,
    @Res() res: Response
    ): Promise<any> {

    let response: ResponseData = new ResponseData();

    let dataGrpc = await this.channelOrderFoodTokenService.getListGrpc(
      user.restaurant_id , restaurantBrandId ,channelOrderFoodId , channelOrderFoodTokenId , isConnection
    );

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
    }

    response.setData(dataGrpc?.data?? []);

    return res.status(HttpStatus.OK).send(response);
  }

}
