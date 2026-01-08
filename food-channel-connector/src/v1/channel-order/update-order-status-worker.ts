import axios from "axios";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { HttpStatus } from "@nestjs/common";
import { ChannelFoodCheckOrderRefreshEntity } from "./entity/channel-food-check-order-refresh.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { UtilsBaseFunction } from "src/utils.common/utils.base-function.commom/utils.base-function.comom";
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

export default async function performTask(channelFoodToken: ChannelFoodCheckOrderRefreshEntity): Promise<any> {
  
  let listDetail: any[] = [];  

  if(channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){

    const headers = await UtilsBaseFunction.getHeaderShoppeg();
    
    let dataDetail = await getSHFBillDetailUpdateStatusV2(channelFoodToken.url_order_detail , channelFoodToken.access_token, +channelFoodToken.channel_branch_id , channelFoodToken.channel_order_id , channelFoodToken.channel_order_code , headers);
    
    if(dataDetail.status == HttpStatus.OK){
        listDetail = listDetail.concat([{
            id : channelFoodToken.id,
            channel_order_id : channelFoodToken.channel_order_id,
            status : dataDetail.data.order_status,
            status_string : ''
        }]);
    }

  }

  if(channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER){

    let dataDetail = await getGRFOrderDetailUpdateStatus(
      channelFoodToken.url_order_detail, channelFoodToken.access_token, channelFoodToken.channel_order_id
    );                        
    if(dataDetail.status == HttpStatus.OK){
        listDetail = listDetail.concat(dataDetail.data);
    }

  }

  if(channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER){

    let dataDetail = await getBEFBillDetailUpdateStatus(channelFoodToken.url_order_detail, channelFoodToken.access_token, channelFoodToken.channel_branch_id, `${channelFoodToken.merchant_id}` , channelFoodToken.channel_order_id);
    
            if(dataDetail.status == HttpStatus.OK){
                listDetail = listDetail.concat([{
                    id : channelFoodToken.id,
                    channel_order_id : channelFoodToken.channel_order_id,
                    status : dataDetail.data.order_status,
                    status_string : ''
                }]);
            }
  }

  if(channelFoodToken.channel_order_food_id == +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER){

    let dataDetail = await getCNVBillDetailUpdateStatus(channelFoodToken.url_order_detail, channelFoodToken.access_token, channelFoodToken.channel_order_id);
    
    if(dataDetail.status == HttpStatus.OK){
        listDetail = listDetail.concat([{
            id : channelFoodToken.id,
            channel_order_id : channelFoodToken.channel_order_id,
            status : 0,
            status_string : dataDetail.data.order_status
        }]);
    }
  }
    
  return {
    orders : listDetail
  };
}

// ------------------ SHF --------------------

// const curlCommand = `curl -X GET --location "${fullUrl}" \
// --header 'user-agent: language=vi app_type=29' \
// --header 'x-foody-access-token: ${access_token}' \
// --header 'x-foody-app-type: 1024' \
// --header 'x-foody-entity-id: ${channel_branch_id}' \
// --header 'Content-Type: application/json'`;


async function getSHFBillDetailUpdateStatus(url: string, access_token: string, x_foody_entity_id: number , order_id : string , order_code : string): Promise<any> {
    try {


      const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;
      const headers = {
        'x-foody-access-token': access_token,
        'x-foody-entity-id': x_foody_entity_id,
        'x-sap-ri': UtilsBaseFunction.createXSapRi(),
        'user-agent' : ChannelOrderFoodApiEnum.SHF_USER_AGENT,
        'x-foody-app-type':"1024",
      };

      

      const data = await axios.get(fullUrl, { headers });

      const info  = data.data.data.order ; 
      
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
                                                          order_id: info.id,
                                                          order_status: info.order_status
                                                        });
     
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

      return new ResponseData(statusCode, message, {});
    }
}

async function getSHFBillDetailUpdateStatusV2(url: string, access_token: string, x_foody_entity_id: number , order_id : string , order_code : string , headers : string): Promise<any> {
  try {


    const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;

    const headerStrings = Object.entries(JSON.parse(headers))
    .map(([key, value]) => `--header '${key}: ${value}'`)
    .join(' \\\n  ');

    const curlCommand = `curl -X GET --location "${fullUrl}" \
    ${headerStrings} \
    --header 'x-foody-access-token: ${access_token}' \
    --header 'x-foody-entity-id: ${x_foody_entity_id}'`;

    const result = await execAsync(curlCommand);
    const info = JSON.parse(result.stdout).data.order ;
    
    return new ResponseData(HttpStatus.OK, "SUCCESS", {
                                                        order_id: info.id,
                                                        order_status: info.order_status
                                                      });
   
  } catch (error) {
    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

    return new ResponseData(statusCode, message, {});
  }
}
// ------------------ SHF --------------------

// ------------------ GRF --------------------


async function getGRFOrderDetailUpdateStatus(url: string, access_token: string, order_id: string): Promise<any> {
    try {


      const headers = {
        'Authorization': access_token
      };
      const fullUrl = `${url}/${order_id}`;

      const data = await axios.get(fullUrl, { headers });

      const order = data.data.order;       

      const isorderBookings = !order.orderBookings ? 0 : 1 ; 

      if(isorderBookings == 0){

        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          [{
            channel_order_id: order.orderID,
            status_string: order.state,
            status:0,
            id : 0,
            display_id:order.displayID
          }]
        ); 

      }else{

        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          order.orderBookings.map((x) => ({
            channel_order_id: order.orderID,
            status_string: x.state,
            status:0,
            id : 0,
            display_id:x.shortOrderID
          }))
        );    

      }  
    
    }
    catch (error) {

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

      return new ResponseData(statusCode, message, [{
              channel_order_id: '',
              status_string: '',
              status:0,
              id : 0,
              display_id:''
            }]
        );
    }

  }
 // ------------------ GRF --------------------
 // ------------------ BEF --------------------


 async function getBEFBillDetailUpdateStatus(url: string, access_token: string, channel_branch_id: string, merchant_id: string, order_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        order_id: +order_id,
      };

      const data = await axios.post(url, JSON.stringify(body), { headers });

      if (data.data.code == 143) {

        const billDetail =  data.data.order;   
    
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id : billDetail.order_id,
          order_status : billDetail.delivery_status

        });

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {});
      }

    }
    catch (error) {

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

      return new ResponseData(statusCode, message, {
          order_id: 0,
          order_status: 0
          }
        );
    }

 }
 // ------------------ BEF --------------------

 async function getCNVBillDetailUpdateStatus(url: string, access_token: string,order_id: string): Promise<any> {
  try {

    const headers = {
      'Content-Type': 'application/json',
      "Authorization": access_token
    };

    const data = await axios.get(`${url}${order_id}.json`, { headers });    

    if (data.status == HttpStatus.OK) {

      const billDetail =  data.data.order;   
  
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        order_id : billDetail.order_id,
        order_status : billDetail.fulfillment_status

      });

    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {});
    }

  }
  catch (error) {

    const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
    const message = error.response?.statusText || "Lỗi getCNVBillDetailUpdateStatus";

    return new ResponseData(statusCode, message, {
        order_id: 0,
        order_status: ''
        }
      );
  }

}