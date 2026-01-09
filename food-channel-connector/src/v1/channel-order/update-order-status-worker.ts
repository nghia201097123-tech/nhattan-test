import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { HttpStatus } from "@nestjs/common";
import { ChannelFoodCheckOrderRefreshEntity } from "./entity/channel-food-check-order-refresh.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { UtilsBaseFunction } from "src/utils.common/utils.base-function.commom/utils.base-function.comom";
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

/**
 * Safe JSON parse với error handling
 */
function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[safeJsonParse] Failed to parse JSON:', error);
    return defaultValue;
  }
}

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

async function getSHFBillDetailUpdateStatusV2(url: string, access_token: string, x_foody_entity_id: number , order_id : string , order_code : string , headers : string): Promise<any> {
  try {


    const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;

    const headerStrings = Object.entries(JSON.parse(headers))
    .map(([key, value]) => `--header '${key}: ${value}'`)
    .join(' \\\n  ');

    const curlCommand = `curl -s -X GET --location "${fullUrl}" \
    ${headerStrings} \
    --header 'x-foody-access-token: ${access_token}' \
    --header 'x-foody-entity-id: ${x_foody_entity_id}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { data: { order: null } });

    const info = data.data?.order;

    if (!info) {
      return new ResponseData(HttpStatus.BAD_REQUEST, "Order not found", {});
    }

    return new ResponseData(HttpStatus.OK, "SUCCESS", {
                                                        order_id: info.id,
                                                        order_status: info.order_status
                                                      });

  } catch (error: any) {
    console.error('[getSHFBillDetailUpdateStatusV2] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi ! getSHFBillDetailUpdateStatusV2";

    return new ResponseData(statusCode, message, {});
  }
}
// ------------------ SHF --------------------

// ------------------ GRF --------------------


async function getGRFOrderDetailUpdateStatus(url: string, access_token: string, order_id: string): Promise<any> {
    try {

      const fullUrl = `${url}/${order_id}`;

      const curlCommand = `curl -s -X GET '${fullUrl}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = safeJsonParse(result.stdout, { order: null });

      const order = data.order;

      if (!order) {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "Order not found",
          [{
            channel_order_id: '',
            status_string: '',
            status:0,
            id : 0,
            display_id:''
          }]
        );
      }

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
          order.orderBookings.map((x: any) => ({
            channel_order_id: order.orderID,
            status_string: x.state,
            status:0,
            id : 0,
            display_id:x.shortOrderID
          }))
        );

      }

    }
    catch (error: any) {
      console.error('[getGRFOrderDetailUpdateStatus] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getGRFOrderDetailUpdateStatus";

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

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        order_id: +order_id,
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = safeJsonParse(result.stdout, { code: 0, order: null });

      if (data.code == 143 && data.order) {

        const billDetail =  data.order;

        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id : billDetail.order_id,
          order_status : billDetail.delivery_status

        });

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", {});
      }

    }
    catch (error: any) {
      console.error('[getBEFBillDetailUpdateStatus] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getBEFBillDetailUpdateStatus";

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

    const fullUrl = `${url}${order_id}.json`;

    const curlCommand = `curl -s -X GET '${fullUrl}' \
      --header 'Content-Type: application/json' \
      --header 'Authorization: ${access_token}'`;

    const result = await execAsync(curlCommand);
    const data = safeJsonParse(result.stdout, { order: null });

    if (data.order) {

      const billDetail =  data.order;

      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        order_id : billDetail.order_id,
        order_status : billDetail.fulfillment_status

      });

    } else {
      return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", {});
    }

  }
  catch (error: any) {
    console.error('[getCNVBillDetailUpdateStatus] Error:', error.message);
    const statusCode = HttpStatus.BAD_REQUEST;
    const message = error.message || "Lỗi getCNVBillDetailUpdateStatus";

    return new ResponseData(statusCode, message, {
        order_id: 0,
        order_status: ''
        }
      );
  }

}
