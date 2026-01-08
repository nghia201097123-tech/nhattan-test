import { parentPort, workerData } from "worker_threads";
import axios from "axios";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { HttpStatus } from "@nestjs/common";
import { FoodChannelTokenValidatorEntity } from "./entity/food-channel-token-validator.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { UtilsBaseFunction } from "src/utils.common/utils.base-function.commom/utils.base-function.comom";

async function performTask(channelFoodToken: FoodChannelTokenValidatorEntity): Promise<any> {

  let error :  any[] = [];    

  if(channelFoodToken.channel_order_food_id === 1){

    let dataSHF = await getSHFBillNewList(channelFoodToken.access_token, +channelFoodToken.channel_branch_id);
          
    if (dataSHF.status == HttpStatus.UNAUTHORIZED || dataSHF.message == 'Bad Request') {
        error = error.concat([{
                  code : "SHF",
                  message : "Vui lòng kết nối lại tài khoản " + channelFoodToken.channel_order_food_token_name,
                  channel_order_food_token_id : channelFoodToken.channel_order_food_token_id
                }]);
    }
    
  }

  if(channelFoodToken.channel_order_food_id === 2){

    let dataGRF = await getGRFNewOrderList(channelFoodToken.access_token);
      if (dataGRF.status == HttpStatus.UNAUTHORIZED) {        
        error = error.concat([{
                    code : "GRF",
                    message : "Vui lòng kết nối lại tài khoản " + channelFoodToken.channel_order_food_token_name,
                    channel_order_food_token_id : channelFoodToken.channel_order_food_token_id

                  }]);
      }
    }

    if(channelFoodToken.channel_order_food_id === 4){

        let dataBEF = await getBEFBillListNew(channelFoodToken.access_token, channelFoodToken.channel_branch_id , channelFoodToken.merchant_id);

        if (dataBEF.status == HttpStatus.UNAUTHORIZED) {
            error = error.concat([{
                        code : "BEF",
                        message : "Vui lòng kết nối lại tài khoản " + channelFoodToken.channel_order_food_token_name,
                        channel_order_food_token_id : channelFoodToken.channel_order_food_token_id
                    }]);
        }  
    }

  return {
    error : error
  };
}

async function runWorker() {
  const result = await performTask(workerData.data);
  parentPort.postMessage(result);
}

runWorker();


// ------------------ SHF --------------------

async function getSHFBillNewList(access_token: string, x_foody_entity_id: number): Promise<any> {

    try {

      const url : string = ChannelOrderFoodApiEnum.SHF_GET_BILL_LIST;

      const headers = {
        'x-foody-access-token': access_token,
        'x-foody-entity-id': x_foody_entity_id,
        'x-sap-ri': UtilsBaseFunction.createXSapRi(),
        'user-agent' : ChannelOrderFoodApiEnum.SHF_USER_AGENT,
        'x-foody-app-type':"1024",
      };

      const body = {
        "order_filter_type": 31,
        "next_item_id": "",
        "request_count": 500000,
        "sort_type": 5
      }

      const data = await axios.post(url, JSON.stringify(body), { headers });
      
      const orders = data.data.data.orders.map(o => ({
        order_id: o.id,
        order_code: o.code,
        total_amount: o.total_value_amount,
        discount_amount : o.commission.amount,
        order_amount : o.order_value_amount ,
        customer_order_amount : o.customer_bill.total_amount, 
        customer_discount_amount : o.customer_bill.total_discount, 
        created_at: o.order_time,
        order_status: o.order_status,
        driver_name: o.assignee.name,
        driver_avatar: o.assignee.avatar_url,
        foods:
          o.order_items.map(f => ({
            food_id: f.dish.id,
            price: f.dish.original_price,
            food_price_addition : f.original_price,
            food_name: f.dish.name,
            quantity: f.quantity,
            note : !f.note ? '' : f.note,
            options : f.options_groups.flatMap(group =>
                  group.options.map(option => ({
                  name: option.name,
                  price : option.original_price,
                  quantity: option.quantity
              })))
          }))

      }));                        
      
      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error) {      
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

      return new ResponseData(statusCode, message, []);

    }

  }

// ------------------ SHF --------------------

// ------------------ GRF --------------------
async function getGRFNewOrderList(access_token: string): Promise<any> {

    try {

      const url : string = ChannelOrderFoodApiEnum.GRF_GET_NEW_ORDER_LIST;

      const headers = {
        'Authorization': access_token
      };

      const data = await axios.get(url, { headers });      

      const orders = data.data.orders
      .map(o => ({
        order_id: o.orderID,
        order_amount: parseFloat(o.orderValue.replace(/\./g, '')),
        status_string: o.state,
        created_at: o.times.createdAt.replace('T', ' ').replace('Z', ''),
        driver_name : o.driver.name,
        driver_avatar : o.driver.avatar,
        display_id : o.displayID
      }));      

      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error) {

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

      return new ResponseData(statusCode, message, []);
    }
  }

 // ------------------ GRF --------------------
 // ------------------ BEF --------------------

 async function getBEFBillListNew(access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const url : string = ChannelOrderFoodApiEnum.BEF_GET_BILL_LIST;


      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        fetch_type: "in_progress"
      };
  
      const data = await axios.post(url, JSON.stringify(body), { headers });      

      if (data.data.code == 143) {

        const moment = require('moment');

        const bills = data.data.restaurant_orders.map(item => ({
          order_id: item.order_id,
          order_amount: item.order_amount,
          driver_name: item.driver_name,
          order_status: item.delivery_status,
          created_at: moment(item.created_at).format('YYYY-MM-DD HH:mm')
        }));

        return new ResponseData(HttpStatus.OK, "SUCCESS", bills);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }

    }
    catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

      return new ResponseData(statusCode, message, []);

    }

  }

 // ------------------ BEF --------------------
