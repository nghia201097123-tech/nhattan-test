// channel-order-food-api.controller.ts
import { Controller, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChannelOrderFoodApiBEFService } from './channel-order-food-api-bef.service';
import { ChannelOrderFoodApiSHFService } from './channel-order-food-api-shf.service';
import { ChannelOrderFoodApiGRFService } from './channel-order-food-api-grf.service';
import { GrpcMethod } from '@nestjs/microservices';
import { BaseResponseData } from 'src/utils.common/utils.response.common/utils.base.response.common';
import { ChannelFoodTokenGrabfoodEntity } from './entity/channel-food-token-grabfood.entity';
import { ChannelOrderFoodNumberEnum } from 'src/utils.common/utils.enum.common/utils.channel-order-food-number';

@Controller({
    path: "channel-order-food-apis"
})
@ApiBearerAuth()
export class ChannelOrderFoodApiController {
  constructor(
    private readonly channelOrderFoodApiSHFService: ChannelOrderFoodApiSHFService ,
    private readonly channelOrderFoodApiGRFService: ChannelOrderFoodApiGRFService ,
    private readonly channelOrderFoodApiBEFService: ChannelOrderFoodApiBEFService ,
    ) {}

  @GrpcMethod("ChannelOrderFoodApiService", "getFoods")
  async getFoods(data: { url: string, access_token: string, channel_branch_id: string, merchant_id: string , channel_order_food_id : number , url_get_account_information_detail : string}): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      let dataResult : any;

      if(data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER ){
        dataResult = await this.channelOrderFoodApiSHFService.getSHFFoodList(data.url , data.access_token , +data.channel_branch_id);        
      }

      if(data.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER ){
        dataResult = await this.channelOrderFoodApiGRFService.getGRFFoodList(data.url , data.access_token);
      }

      if(data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER ){
        dataResult = await this.channelOrderFoodApiBEFService.getBEFFoodListV2(data.url, data.url_get_account_information_detail, data.access_token , data.channel_branch_id , data.merchant_id);
      }

      response.setStatus(dataResult.status);
      response.setData(dataResult.data);
      response.setMessageError(dataResult.message);
    
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "getFoodToppings")
  async getFoodToppings(data: { url: string, access_token: string, channel_branch_id: string, merchant_id: string , channel_order_food_id : number , url_get_account_information_detail : string}): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      let dataResult : any;
      
      if(data.channel_order_food_id == 1 ){
        dataResult = await this.channelOrderFoodApiSHFService.getSHFFoodToppingList(data.url , data.access_token , +data.channel_branch_id);        
      }

      if(data.channel_order_food_id == 2 ){
        dataResult = await this.channelOrderFoodApiGRFService.getGRFFoodToppingList(data.url , data.access_token);
      }

      if(data.channel_order_food_id == 4 ){
        dataResult = await this.channelOrderFoodApiBEFService.getBEFFoodToppingList(data.url, data.url_get_account_information_detail, data.access_token , data.channel_branch_id , data.merchant_id);
      }

      response.setStatus(dataResult.status);
      response.setData(dataResult.data);
      response.setMessageError(dataResult.message);

      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "updatePriceFoodsSHF")
  async updatePriceFoodsSHF(data: {foods : string , url: string, access_token: string, channel_branch_id: string}): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      
      let countError = await this.channelOrderFoodApiSHFService.updateSHFFoodPrices(JSON.parse(data.foods), data.url, data.access_token, +data.channel_branch_id);
     
      if (countError > 0) {
          response.setStatus(HttpStatus.BAD_REQUEST);
          response.setMessageError("Danh sách món ăn không hợp lệ");
          return response;
      }

      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "updatePriceFoodsBEF")
  async updatePriceFoodsBEF(data: {foods: string, url_food_detail: string ,url_food_update : string , access_token: string, channel_branch_id: string , merchant_id : string}): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();

      let dataFood = JSON.parse(data.foods);

      for (const food of dataFood) {
        let dataBEF = await this.channelOrderFoodApiBEFService.getBEFFoodDetail(data.url_food_detail, data.access_token, data.channel_branch_id, data.merchant_id, food.id);
        
        if (dataBEF.status != HttpStatus.OK) {
            response.setStatus(dataBEF.status);
            response.setMessageError(dataBEF.message);
            return response;
        }
    
        await this.channelOrderFoodApiBEFService.updateBEFFoodPrice(data.url_food_update, data.access_token, data.channel_branch_id, data.merchant_id, dataBEF.data, food.price);
    
    }

      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "getBranches")
  async getBranches(data: {url : string , access_token: string, username : string , channel_order_food_id : number}): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();

      let result = [];

      if(data.channel_order_food_id == 1){
        let dataGrpc = await this.channelOrderFoodApiSHFService.getSHFBranchList(data.url,data.access_token);
        if (dataGrpc.status != HttpStatus.OK) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        result = dataGrpc.data;
      }

      if(data.channel_order_food_id == 2){
        let dataGrpc = await this.channelOrderFoodApiGRFService.getGRFBranchDetail(data.url,data.access_token);
        if (dataGrpc.status != HttpStatus.OK) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        result = [{
          branch_id : data.username,
          branch_name : dataGrpc.data.name,
          merchant_id : '0'
        }];
      }

      if(data.channel_order_food_id == 4){
        let dataGrpc = await this.channelOrderFoodApiBEFService.getBEFBranchList(data.url,data.access_token);
        if (dataGrpc.status != HttpStatus.OK) {
          response.setStatus(dataGrpc.status);
          response.setMessageError(dataGrpc.message);
          return response;
        }

        result = dataGrpc.data;
      }
     
      response.setData(result);
      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "checkTokenGRF")
  async checkTokenGRF(
      data: {
        url_logout : string , 
        url_update_device: string, 
        username: string ,
        password: string ,
        device_id : string,
        device_brand : string 
    }): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      
      let dataToCheckLogout = await this.channelOrderFoodApiGRFService.logoutGRF(
        data.url_logout,
        data.username,
        data.password
      );

      if (dataToCheckLogout.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Thông tin đăng nhập kết nối không hợp lệ . Vui lòng kiểm tra lại");
        return response;
      }      

      let dataToCheckUpdateInfor = await this.channelOrderFoodApiGRFService.updateGRFDeviceInfor(
        data.url_update_device,
        dataToCheckLogout.data.jwt,
        data.device_id,
        data.device_brand
      );

      if (dataToCheckUpdateInfor.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Thông tin đăng nhập kết nối không hợp lệ . Vui lòng kiểm tra lại");
        return response;
      }
      
      response.setData({
        access_token : dataToCheckLogout.data.jwt
      })
      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "checkTokenBEF")
  async checkTokenBEF(
      data: {
        url_login : string , 
        username: string ,
        password: string ,
    }): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      
      let dataToCheckLogin = await this.channelOrderFoodApiBEFService.loginBEF(
        data.url_login,
        data.username,
        data.password
      );

      if (dataToCheckLogin.status != HttpStatus.OK) {
        response.setStatus(HttpStatus.BAD_REQUEST);
        response.setMessageError("Thông tin đăng nhập kết nối không hợp lệ . Vui lòng kiểm tra lại");
        return response;
      }
      
      response.setData({
        access_token : dataToCheckLogin.data.jwt,
        user_id: dataToCheckLogin.data.user_id
      })
      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "reconnectionTokenGRF")
  async reconnectionTokenGRF(
      data: {
        url_login : string , 
        url_update_device: string, 
        username: string ,
        password: string ,
        device_id : string,
        device_brand : string 
    }): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      
      let dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(data.url_login, data.username , data.password, data.device_id, data.device_brand);
        
        if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
            response.setStatus(dataLogin.status);
            response.setMessageError(dataLogin.message);
            return response;
        }

        if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
            await delay(2000);
            dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(data.url_login, data.username, data.password, dataLogin.data.device_id, dataLogin.data.device_brand);
        }        

        if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
          response.setStatus(dataLogin.status);
          response.setMessageError(dataLogin.message);
          return response;
        }

        if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
            await delay(2000);
            dataLogin = await this.channelOrderFoodApiGRFService.logoutGRF(
                data.url_login,
                data.username,
                data.password
              );
        
              if (dataLogin.status != HttpStatus.OK) {
                response.setStatus(dataLogin.status);
                response.setMessageError(dataLogin.message);
                return response;
              }      
        
              await this.channelOrderFoodApiGRFService.updateGRFDeviceInfor(
                data.url_update_device,
                dataLogin.data.jwt,
                data.device_id,
                data.device_brand
              );
        }
        
        response.setData({
          access_token : dataLogin.data.jwt
        })
        response.setStatus(HttpStatus.OK);
        response.setMessageError("Ok");
        return response;

      async function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  @GrpcMethod("ChannelOrderFoodApiService", "reconnectionTokenBEF")
  async reconnectionTokenBEF(
      data: {
        url_login : string , 
        username: string ,
        password: string 
    }): Promise<any> {

      let response: BaseResponseData = new BaseResponseData();
      
      let dataLogin = await this.channelOrderFoodApiBEFService.loginBEF(data.url_login, data.username , data.password);
        
      if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
          response.setStatus(dataLogin.status);
          response.setMessageError(dataLogin.message);
          return response;
      }

      response.setData({
        access_token : dataLogin.data.jwt
      })
      response.setStatus(HttpStatus.OK);
      response.setMessageError("Ok");
      return response;
  }

  @GrpcMethod("ChannelOrderFoodApiService", "confirmChannelOrder")
  async confirmChannelOrder(data: { 
      url_comfirm_order: string, 
      access_token: string, 
      channel_branch_id: string, 
      merchant_id: string , 
      channel_order_food_id : number , 
      url_login : string , 
      url_update_device : string , 
      url_get_branch_detail : string , 
      username : string , 
      password : string , 
      order_id : string , 
      user_id : number,
      device_id : string,
      device_brand : string
    }): Promise<any> {
      let response: BaseResponseData = new BaseResponseData();
      let dataResult : any;

      if(data.channel_order_food_id == 1 ){
        dataResult = await this.channelOrderFoodApiSHFService.confirmSHFBill(data.url_comfirm_order , data.access_token , +data.channel_branch_id , data.order_id);        
      }

      if(data.channel_order_food_id == 2 ){
        dataResult = await this.channelOrderFoodApiGRFService.confirmGRFBill(data.url_comfirm_order , data.access_token , data.order_id);
        
        if (dataResult.status == HttpStatus.UNAUTHORIZED) {
          let dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(data.url_login, data.username , data.password, data.device_id, data.device_brand);
        
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
              response.setStatus(dataLogin.status);
              response.setMessageError(dataLogin.message);
              return response;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(data.url_login, data.username, data.password, dataLogin.data.device_id, dataLogin.data.device_brand);
          }        
  
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
            response.setStatus(dataLogin.status);
            response.setMessageError(dataLogin.message);
            return response;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.logoutGRF(
                  data.url_login,
                  data.username,
                  data.password
                );
          
                if (dataLogin.status != HttpStatus.OK) {
                  response.setStatus(dataLogin.status);
                  response.setMessageError(dataLogin.message);
                  return response;
                }      
          }

          dataResult = await this.channelOrderFoodApiGRFService.confirmGRFBill(data.url_comfirm_order , dataLogin.data.jwt , data.order_id);

        }
      }

      if(data.channel_order_food_id == 4 ){
        dataResult = await this.channelOrderFoodApiBEFService.comfirmBEFBill(data.url_comfirm_order, data.url_get_branch_detail, data.access_token , data.channel_branch_id , data.merchant_id , data.user_id , +data.order_id);

        if(dataResult.status == HttpStatus.UNAUTHORIZED){

          let dataLogin = await this.channelOrderFoodApiBEFService.loginBEF(data.url_login, data.username , data.password);
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
            response.setStatus(dataLogin.status);
            response.setMessageError(dataLogin.message);
            return response;
          }
          dataResult = await this.channelOrderFoodApiBEFService.comfirmBEFBill(data.url_comfirm_order, data.url_get_branch_detail, dataLogin.data.jwt , data.channel_branch_id , data.merchant_id , data.user_id , +data.order_id);
        }
      }
      
      response.setStatus(dataResult.status);
      response.setData(dataResult.data);
      response.setMessageError(dataResult.message);
      
      return response;

      async function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  @GrpcMethod("ChannelOrderFoodApiService", "getEarningSumaryReport")
  async getEarningSummaryReport(data: { 
      tokens: string, 
      from_date : string,
      to_date : string,
    }): Promise<any> {
      let response: BaseResponseData = new BaseResponseData();
      let dataResult : any;           
      
      const listToken = new ChannelFoodTokenGrabfoodEntity().mapToList(JSON.parse(data.tokens));

      let result = {
        net_sales: 0 ,
        net_total:  0 ,
        total_orders:  0 ,
        breakdown_by_category: '[]' ,
      };

      for(const token of listToken) {


        dataResult = await this.channelOrderFoodApiGRFService.getEarningSumaryReport(
          token.url_earning_summary_report , 
          token.access_token , 
          data.from_date,
          data.to_date,
          token.channel_branch_id,
          token.channel_branch_name,
          token.channel_branch_address,
          token.channel_branch_phone,
        );     

        
        if (dataResult.status == HttpStatus.UNAUTHORIZED) {
          let dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(token.url_login, token.username , token.password, token.device_id, token.device_brand);
        
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
              continue;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(token.url_login, token.username, token.password, dataLogin.data.device_id, dataLogin.data.device_brand);
          }        
  
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
            // response.setStatus(dataLogin.status);
            // response.setMessageError(dataLogin.message);
              continue;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.logoutGRF(
                  token.url_login,
                  token.username,
                  token.password
                );
          
                if (dataLogin.status != HttpStatus.OK) {
                  continue;
                }      
          }

          dataResult = await this.channelOrderFoodApiGRFService.getEarningSumaryReport(
            token.url_earning_summary_report , 
            dataLogin.data.jwt , 
            data.from_date,
            data.to_date,
            token.channel_branch_id,
            token.channel_branch_name,
            token.channel_branch_address,
            token.channel_branch_phone
          );  
        }   
        
        result.net_sales += dataResult.data.net_sales;
        result.net_total += dataResult.data.net_total;
        result.total_orders += dataResult.data.total_orders;
        result.breakdown_by_category = this.normalizeJsonArrayString(result.breakdown_by_category.concat(dataResult.data.breakdown_by_category));
      
      }
      
      response.setData(result);      
    
      return response;

      async function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  @GrpcMethod("ChannelOrderFoodApiService", "getEarningSumaryReportV2")
  async getEarningSumaryReportV2(data: { 
      tokens: string, 
      from_date : string,
      to_date : string,
    }): Promise<any> {
      let response: BaseResponseData = new BaseResponseData();
      let dataResult : any;           
      
      const listToken = new ChannelFoodTokenGrabfoodEntity().mapToList(JSON.parse(data.tokens));

      let result = {
        net_sales: 0 ,
        net_total:  0 ,
        total_orders:  0 ,
        breakdown_by_category: '[]' ,
      };      

      for(const token of listToken) {

        dataResult = await this.channelOrderFoodApiGRFService.getEarningSumaryReportV2(
          token.url_earning_summary_report_v2, 
          token.access_token , 
          data.from_date,
          data.to_date,
          token.channel_branch_id,
          token.channel_branch_name,
          token.channel_branch_address,
          token.channel_branch_phone,
        );    

        // dataResult = await this.channelOrderFoodApiGRFService.getEarningSumaryReportV2(
        //   token.url_earning_summary_report_v2, 
        //   'eyJhbGciOiJSUzI1NiIsImtpZCI6Il9kZWZhdWx0IiwidHlwIjoiSldUIn0.eyJhdWQiOiJNRVhVU0VSUyIsImVzaSI6ImdzSGNYOHBUb2VJMVFVcmVPd2ZBL0pDUXRGVnhKNi82K2ZoV0dSQ0FMRXY3UHM4Z2VPTldnQ2orSDVFSXJ3PT0iLCJleHAiOjIyOTc5OTAxNTUsImlhdCI6MTc1Nzk5MDE1MiwianRpIjoiMDBjYzM2MmYtOTJjYy00ZTlkLWE1OWItNmM4NzcxNzJiN2U2IiwibG1lIjoiTkFUSVZFIiwibmFtZSI6IiIsInN1YiI6IjA2OTg1N2Q2LTgxZWQtNDVhYy1iMGIxLWExY2Q5ZjdhNDVhYSJ9.cf8RrYuKjaANVoYrJpzTb-QpWWo_Tas4oZNVwz1fJLNqZs8xEyFzgUAbdiZWpYuQFZ5p-yfhce9sPbiaLbnj_g5Hjhbj2xZtiHkFmwNKYe_FcZkEUvJ6DW6tlKHfOkuR-lylPmOS_4pXExc23J5sNbs0Ej_LsEsOjFxwVINVCInHiK_R16Es53HCxVZ1eSTIeJqCo4xZXSnZGava3jXmQqyuIAdPbyxvPb5CW06LlF2PBvMeOA8b__yCr1Ssenm_dIlQccOn4OPwnTjU4e31eJduIGwrFciK2Xn0l_fSelr3P3ksDYDVKX7M1OIlk6KgLz-OzWdH5xWc9o0oX-IF7Q' , 
        //   data.from_date,
        //   data.to_date,
        //   token.channel_branch_id,
        //   token.channel_branch_name,
        //   token.channel_branch_address,
        //   token.channel_branch_phone,
        // );    

        if (dataResult.status == HttpStatus.UNAUTHORIZED) {
          let dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(token.url_login, token.username , token.password, token.device_id, token.device_brand);
        
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
              continue;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.loginGRF(token.url_login, token.username, token.password, dataLogin.data.device_id, dataLogin.data.device_brand);
          }        
  
          if (dataLogin.status == HttpStatus.BAD_REQUEST || dataLogin.status == HttpStatus.TOO_MANY_REQUESTS) {
              continue;
          }
  
          if (dataLogin.data.jwt == '' || dataLogin.data.jwt == null) {
              await delay(2000);
              dataLogin = await this.channelOrderFoodApiGRFService.logoutGRF(
                  token.url_login,
                  token.username,
                  token.password
                );
          
                if (dataLogin.status != HttpStatus.OK) {
                  continue;
                }      
          }

          dataResult = await this.channelOrderFoodApiGRFService.getEarningSumaryReportV2(
            token.url_earning_summary_report_v2, 
            dataLogin.data.jwt , 
            data.from_date,
            data.to_date,
            token.channel_branch_id,
            token.channel_branch_name,
            token.channel_branch_address,
            token.channel_branch_phone
          );  
        }   
        
        result.net_sales += dataResult.data.net_sales;
        result.net_total += dataResult.data.net_total;
        result.total_orders += dataResult.data.total_orders;
        result.breakdown_by_category = this.normalizeJsonArrayString(result.breakdown_by_category.concat(dataResult.data.breakdown_by_category));
      
      }
      
      response.setData(result);      
    
      return response;

      async function delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
  }


  private normalizeJsonArrayString(jsonStr: string): string {
    if (!jsonStr || jsonStr === '[]') return '[]';
    return jsonStr
      .replace(/\]\[/g, ',')  // Thay thế ][ bằng ,
      .replace(/,\]/g, ']')   // Xóa dấu phẩy trước ]
      .replace(/\[,/g, '[');  // Xóa dấu phẩy sau [
  }
}
