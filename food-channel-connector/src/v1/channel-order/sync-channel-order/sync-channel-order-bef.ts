import { HttpStatus } from "@nestjs/common";
import { ResponseListData } from "src/utils.common/utils.response.common/utils.list.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { SyncChannelOrderInterface } from "src/v1/interface-class/sync-channel-order";
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

export class SyncChannelOrderBefService implements SyncChannelOrderInterface {

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

  async getOrders(
    url: string,
    access_token: string,
    channel_branch_id: string,
    merchant_id: string
  ): Promise<ResponseListData> {
    try {
      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        fetch_type: "in_progress",
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {
        const bills = (data.restaurant_orders || []).map((item: any) => ({
          order_id: item.order_id,
          order_amount: item.order_amount,
          driver_name: item.driver_name,
          driver_phone: item.driver_phone_no,
          order_status: item.delivery_status,
          deliver_time: item.to_be_delivered_at ?? "",
          is_scheduled_order: 0,
        }));

        return new ResponseListData(HttpStatus.OK, "SUCCESS", bills);
      } else {
        return new ResponseListData(
          HttpStatus.BAD_REQUEST,
          data.message || "Error",
          []
        );
      }
    } catch (error: any) {
      console.error('[getOrders] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getBEFBillNewList";

      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderHistories(
    url: string,
    access_token: string,
    channel_branch_id: string,
    merchant_id: string
  ): Promise<ResponseListData> {
    try {
      const moment = require("moment");

      const body = JSON.stringify({
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        page: 1,
        limit: 30,
        fetch_type: "previous",
        start_date: moment(new Date()).format("YYYY-MM-DD"),
        end_date: moment(new Date()).format("YYYY-MM-DD"),
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {
        const bills = (data.restaurant_orders || []).map((item: any) => ({
          order_id: item.order_id,
          order_status: item.delivery_status,
          driver_name: item.driver_name,
          driver_phone: item.driver_phone_no,
        }));

        return new ResponseListData(HttpStatus.OK, "SUCCESS", bills);
      } else {
        return new ResponseListData(
          HttpStatus.BAD_REQUEST,
          data.message || "Error",
          []
        );
      }
    } catch (error: any) {
      console.error('[getOrderHistories] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getBEFBillHistoryList";

      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderDetail(
    url: string,
    access_token: string,
    order_id: string,
    channel_branch_id: string,
    merchant_id: string
  ): Promise<any> {
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
        const order = data.order;
        const orderResult = {
          order_id: order.order_id,
          discount_amount: order.jugnoo_commission,
          total_amount: order.net_order_amount,
          customer_order_amount: order.total_amount,
          customer_discount_amount: !order.offers
            ? 0
            : [
                ...(order.offers.delivery_discounts || []),
                ...(order.offers.food_discounts || []),
              ].reduce(
                (total: number, discount: any) => total + discount.partner_discount,
                0
              ),
          customer_name: order.customer_name,
          customer_phone: order.customer_phone_no || "",
          customer_address: order.delivery_address,
          note: order.delivery_note,
          item_discount_amount: order.order_discount?.merchant_discount ?? 0,
          foods: (order.order_items || []).map((item: any) => ({
            food_id: item.item_id,
            food_name: item.item_name,
            quantity: item.quantity,
            food_price_addition: item.amount,
            price: item.unit_price,
            note: item.note,
            options: this.safeJsonParse(item.customize_json, []).flatMap((customize: any) =>
              (customize.options || []).map((option: any) => ({
                id: option.id,
                name: option.name,
                price: option.price,
                quantity: option.quantity,
              }))
            ),
          })),
        };

        return new ResponseData(HttpStatus.OK, "SUCCESS", orderResult);
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", []);
      }
    } catch (error: any) {
      console.error('[getOrderDetail] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getBEFBillDetail";

      return new ResponseData(statusCode, message, {
        order_id: "",
        discount_amount: 0,
        total_amount: 0,
        customer_order_amount: 0,
        customer_discount_amount: 0,
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        foods: [],
      });
    }
  }

  async loginBEF(
    url: string,
    usernamne: string,
    password: string
  ): Promise<any> {
    try {
      let body: any = {};

      if (!usernamne.includes("@")) {
        usernamne = usernamne.replace(/^0/, "+84");
        body = {
          password: password,
          phone_no: usernamne,
        };
      } else {
        body = {
          password: password,
          email: usernamne,
        };
      }

      const bodyStr = JSON.stringify(body);
      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --data '${bodyStr.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { code: 0 });

      if (data.code == 143) {
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          jwt: !data.token ? "" : data.token,
        });
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.message || "Error", {
          jwt: "",
        });
      }
    } catch (error: any) {
      console.error('[loginBEF] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! loginBEF";

      return new ResponseData(statusCode, message, {
        jwt: "",
      });
    }
  }

  async syncTokenBEF(
    url_login: string,
    usernamne: string,
    password: string
  ): Promise<any> {
    let data = await this.loginBEF(url_login, usernamne, password);

    if (data.status != HttpStatus.OK) {
      return "";
    }

    return data.data.jwt;
  }
}
