import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

@Injectable()
export class ChannelOrderFoodApiBEFService {
  constructor() { }

  /**
   * Safe JSON parse với error handling
   */
  private safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('[safeJsonParse] Failed to parse JSON:', error);
      return defaultValue;
    }
  }

  // -------------------------------- BEF --------------------------------

  async loginBEF(url: string, usernamne: string, password: string): Promise<any> {
    try {

      let body: any = {};

      if (!usernamne.includes('@')) {
          usernamne = usernamne.replace(/^0/, '+84');

          body = {
              password: password,
              phone_no: usernamne,
            }
      }else {
          body = {
              password: password,
              email: usernamne,
            }
      }

      const bodyStr = JSON.stringify(body);
      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${bodyStr.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            jwt: !data.token ? "" : data.token,
            user_id : data?.user?.user_id ?? 0
          });
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error",{jwt : ""});

      }
    }
    catch (error: any) {
      console.error('[loginBEF] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! loginBEF",
        {jwt : ""}
      );
    }

  }


  async getBEFBranchList(url: string, access_token: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

        const allBranches = (data.data || []).reduce((accumulator: any[], merchant: any) => {
          const storeProfiles = (merchant.store_profiles || []).map((store: any) => ({
            merchant_id: merchant.merchant_id,
            branch_id: store.store_id,
            branch_name: store.store_name
          }));
          return accumulator.concat(storeProfiles);
        }, []);

        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          allBranches
        );
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);

      }

    }
    catch (error: any) {
      console.error('[getBEFBranchList] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFBranchList",
        []
      );

    }

  }

  async getBEFFoodList(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { flag: 0 });

      if (data.flag == 143) {

        const allBranches = (data.restaurant_items || []).reduce((accumulator: any[], merchant: any) => {
          const storeProfiles = (merchant.items || []).map((item: any) => ({
            id: item.restaurant_item_id,
            name: item.item_name,
            price: item.price,
            picture_url: item.item_image,
            description: item.item_details,
            is_pending: 0
          }));
          return accumulator.concat(storeProfiles);
        }, []);

        return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }

    }
    catch (error: any) {
      console.error('[getBEFFoodList] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFFoodList",
        []
      );

    }

  }

  async getBEFFoodListV2(url_get_branch_food_list : string , url_get_branch_info : string , access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const body_get_branch_info = JSON.stringify({
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      });

      const curlCommand1 = `curl -s -X POST '${url_get_branch_info}' \
        --header 'Content-Type: application/json' \
        --data '${body_get_branch_info.replace(/'/g, "'\\''")}'`;

      const result1 = await execAsync(curlCommand1);
      const dataGetBranchInfo = this.safeJsonParse(result1.stdout, { flag: 0 });

      if (dataGetBranchInfo.flag == 143) {

        const body_get_branch_food_list = JSON.stringify({
          access_token: access_token,
          restaurant_id: +channel_branch_id,
          merchant_id: +merchant_id,
          vendor_id : +dataGetBranchInfo.store.vendor_id
        });

        const curlCommand2 = `curl -s -X POST '${url_get_branch_food_list}' \
          --header 'Content-Type: application/json' \
          --data '${body_get_branch_food_list.replace(/'/g, "'\\''")}'`;

        const result2 = await execAsync(curlCommand2);
        const data = this.safeJsonParse(result2.stdout, { flag: 0 });

        if (data.flag == 143) {

          const allBranches = (data.restaurant_items || []).reduce((accumulator: any[], merchant: any) => {
            const storeProfiles = (merchant.items || []).map((item: any) => ({
              id: item.restaurant_item_id,
              name: item.item_name,
              price: item.price,
              picture_url: item.item_image,
              description: item.item_details,
              is_pending: 0
            }));
            return accumulator.concat(storeProfiles);
          }, []);

          return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);

        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
        }
      }

      return new ResponseData(HttpStatus.BAD_REQUEST, dataGetBranchInfo.message || "Error", []);

    }
    catch (error: any) {
      console.error('[getBEFFoodListV2] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFFoodListV2",
        []
      );

    }

  }

  async getBEFFoodToppingList(url_get_branch_food_list : string , url_get_branch_info : string , access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const body_get_branch_info = JSON.stringify({
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      });

      const curlCommand1 = `curl -s -X POST '${url_get_branch_info}' \
        --header 'Content-Type: application/json' \
        --data '${body_get_branch_info.replace(/'/g, "'\\''")}'`;

      const result1 = await execAsync(curlCommand1);
      const dataGetBranchInfo = this.safeJsonParse(result1.stdout, { flag: 0 });

      if (dataGetBranchInfo.flag == 143) {

        const body_get_branch_food_list = JSON.stringify({
          access_token: access_token,
          restaurant_id: +channel_branch_id,
          merchant_id: +merchant_id,
          vendor_id : +dataGetBranchInfo.store.vendor_id
        });

        const curlCommand2 = `curl -s -X POST '${url_get_branch_food_list}' \
          --header 'Content-Type: application/json' \
          --data '${body_get_branch_food_list.replace(/'/g, "'\\''")}'`;

        const result2 = await execAsync(curlCommand2);
        const data = this.safeJsonParse(result2.stdout, { flag: 0 });

        if (data.flag == 143) {

            const foodToppings = (data.item_customizes || []).map((group: any) => ({
              id: group.customize_id,
              name: group.name,
              list: (group.customize_options || []).map((option: any) => ({
                id: option.option_id,
                name: option.name,
                price: option.price,
              }))
            }));

          return new ResponseData(HttpStatus.OK, "SUCCESS", foodToppings);

        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
        }
      }

      return new ResponseData(HttpStatus.BAD_REQUEST, dataGetBranchInfo.message || "Error", []);

    }
    catch (error: any) {
      console.error('[getBEFFoodToppingList] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFFoodToppingList",
        []
      );

    }

  }


  async getBEFFoodListToCheckBillDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { flag: 0 });

      if (data.flag == 143) {

        const allBranches = (data.restaurant_items || []).reduce((accumulator: any[], merchant: any) => {
          const storeProfiles = (merchant.items || []).map((item: any) => ({
            id: item.restaurant_item_id,
            name: item.item_name
          }));
          return accumulator.concat(storeProfiles);
        }, []);

        return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }

    }
    catch (error: any) {
      console.error('[getBEFFoodListToCheckBillDetail] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFFoodListToCheckBillDetail",
        []
      );

    }

  }


  async getBEFFoodDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string, food_id: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        restaurant_item_id: +food_id
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { flag: 0 });

      if (data.flag == 143) {

        const food = {
          id: data.restaurant_item.restaurant_item_id,
          name: data.restaurant_item.item_name,
          price: data.restaurant_item.price,
          picture_url: data.restaurant_item.item_image,
          description: data.restaurant_item.item_details,
          old_price: data.restaurant_item.old_price,
          category_id: data.restaurant_item.category_id
        };


        return new ResponseData(HttpStatus.OK, "SUCCESS", food);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", {});
      }

    }
    catch (error: any) {
      console.error('[getBEFFoodDetail] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFFoodDetail",
        {}
      );

    }

  }


  async updateBEFFoodPrice(url: string, access_token: string, channel_branch_id: string, merchant_id: string, _data: any, newPrice: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        restaurant_item: {
          restaurant_item_id: +_data.id,
          category_id: +_data.category_id,
          item_name: _data.name,
          item_details: _data.description,
          old_price: +newPrice,
          item_image: _data.picture_url

        }
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { flag: 0 });

      if (data.flag == 143) {
        return new ResponseData(HttpStatus.OK, "SUCCESS");

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error");
      }

    }
    catch (error: any) {
      console.error('[updateBEFFoodPrice] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! updateBEFFoodPrice"
      );

    }

  }

  async getBEFBillListNew(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        fetch_type: "in_progress"
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

        const moment = require('moment');

        const bills = (data.restaurant_orders || []).map((item: any) => ({
          order_id: item.order_id,
          order_amount: item.order_amount,
          driver_name: item.driver_name,
          order_status: item.delivery_status,
          created_at: moment(item.created_at).format('YYYY-MM-DD HH:mm')
        }));

        return new ResponseData(HttpStatus.OK, "SUCCESS", bills);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }

    }
    catch (error: any) {
      console.error('[getBEFBillListNew] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFBillNewList",
        []
      );

    }

  }

  async getBEFBillListHistory(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {


      const moment = require('moment');

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        page: 1,
        limit: 1000000,
        fetch_type: "previous",
        start_date: moment(new Date).format('YYYY-MM-DD'),
        end_date: moment(new Date).format('YYYY-MM-DD'),
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

        const bills = (data.restaurant_orders || []).map((item: any) => ({
          order_id: item.order_id,
          order_status: item.delivery_status
        }));

        return new ResponseData(HttpStatus.OK, "SUCCESS", bills);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }

    }
    catch (error: any) {
      console.error('[getBEFBillListHistory] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFBillHistoryList",
        []
      );

    }

  }

  async getBEFBillDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string, order_id: string): Promise<any> {
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
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

        const billDetails = (data.order.order_items || []).map((item: any) => ({
          order_id: data.order.order_id,
          discount_amount : data.order.jugnoo_commission,
          total_amount : data.order.net_order_amount,
          customer_order_amount : data.order.total_amount,
          customer_discount_amount : !data.order.offers ? 0 : [...(data.order.offers.delivery_discounts || []), ...(data.order.offers.food_discounts || [])]
          .reduce((total: number, discount: any) => total + discount.discount_value, 0),
          food_id: item.item_id,
          food_name: item.item_name,
          quantity: item.quantity,
          food_price_addition: item.original_amount,
          price: item.unit_price,
          note : item.note,
          customer_name : data.order.customer_name,
          customer_phone : !data.order.customer_phone_no ? '' : data.order.customer_phone_no,
          customer_address : data.order.delivery_address,
          options : this.safeJsonParse(item.customize_json, []).flatMap((customize: any) =>
                  (customize.options || []).map((option: any) => ({
                  name: option.name,
                  price: option.price,
                  quantity : option.quantity
              }))
          )
        }));

        return new ResponseData(HttpStatus.OK, "SUCCESS", billDetails);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }

    }
    catch (error: any) {
      console.error('[getBEFBillDetail] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFBillDetail",
        []
      );

    }

  }

  async getBEFBillDetailUpdateStatus(url: string, access_token: string, channel_branch_id: string, merchant_id: string, order_id: string): Promise<any> {
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
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {

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
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getBEFBillDetailUpdateStatus",
        {}
      );

    }

  }

  async comfirmBEFBill(url: string, url_get_branch_info : string ,access_token: string, channel_branch_id: string, merchant_id: string , user_id : number , order_id : number ): Promise<any> {
    try {

      const body_get_branch_info = JSON.stringify({
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      });

      const curlCommand1 = `curl -s -X POST '${url_get_branch_info}' \
        --header 'Content-Type: application/json' \
        --data '${body_get_branch_info.replace(/'/g, "'\\''")}'`;

      const result1 = await execAsync(curlCommand1);
      const dataGetBranchInfo = this.safeJsonParse(result1.stdout, { flag: 0 });

      if (dataGetBranchInfo.flag == 143) {

          const body = JSON.stringify({
            access_token: access_token,
            restaurant_id: +channel_branch_id,
            merchant_id: +merchant_id,
            user_id : user_id,
            order_id : order_id,
            vendor_id : +dataGetBranchInfo.store.vendor_id
          });

          const curlCommand2 = `curl -s -X POST '${url}' \
            --header 'Content-Type: application/json' \
            --data '${body.replace(/'/g, "'\\''")}'`;

          const result2 = await execAsync(curlCommand2);
          const data = this.safeJsonParse(result2.stdout, { flag: 0 });

          if (data.flag == 143) {
            return new ResponseData(HttpStatus.OK, "SUCCESS");
            }
          else{
            return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error");
          }
        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, dataGetBranchInfo.message || "Error");
        }
    }
    catch (error: any) {
      console.error('[comfirmBEFBill] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! comfirmBEFBill",
        []
      );

    }

  }

}
