import { HttpStatus } from "@nestjs/common";
import axios from "axios";
import { ResponseListData } from "src/utils.common/utils.response.common/utils.list.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { SyncChannelOrderInterface } from "src/v1/interface-class/sync-channel-order";

export class SyncChannelOrderBefService implements SyncChannelOrderInterface {
  async getOrders(
    url: string,
    access_token: string,
    channel_branch_id: string,
    merchant_id: string
  ): Promise<ResponseListData> {
    try {
      const data = await axios.post(
        url,
        JSON.stringify({
          access_token: access_token,
          restaurant_id: +channel_branch_id,
          merchant_id: +merchant_id,
          fetch_type: "in_progress",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data.data.code == 143) {
        const bills = data.data.restaurant_orders.map((item) => ({
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
          data.data.message,
          []
        );
      }
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message =
        error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

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

      const headers = {
        "Content-Type": "application/json",
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        page: 1,
        limit: 30,
        fetch_type: "previous",
        start_date: moment(new Date()).format("YYYY-MM-DD"),
        end_date: moment(new Date()).format("YYYY-MM-DD"),
      };

      const data = await axios.post(url, JSON.stringify(body), { headers });

      if (data.data.code == 143) {
        const bills = data.data.restaurant_orders.map((item) => ({
          order_id: item.order_id,
          order_status: item.delivery_status,
          driver_name: item.driver_name,
          driver_phone: item.driver_phone_no,
        }));

        return new ResponseListData(HttpStatus.OK, "SUCCESS", bills);
      } else {
        return new ResponseListData(
          HttpStatus.BAD_REQUEST,
          data.data.message,
          []
        );
      }
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message =
        error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

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
      const headers = {
        "Content-Type": "application/json",
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        order_id: +order_id,
      };

      const data = await axios.post(url, JSON.stringify(body), { headers });

      if (data.data.code == 143) {
        const result = {
          order_id: data.data.order.order_id,
          discount_amount: data.data.order.jugnoo_commission,
          total_amount: data.data.order.net_order_amount,
          customer_order_amount: data.data.order.total_amount,
          customer_discount_amount: !data.data.order.offers
            ? 0
            : [
                ...data.data.order.offers.delivery_discounts,
                ...data.data.order.offers.food_discounts,
              ].reduce(
                (total, discount) => total + discount.partner_discount,
                0
              ),
          customer_name: data.data.order.customer_name,
          customer_phone: data.data.order.customer_phone_no || "",
          customer_address: data.data.order.delivery_address,
          note: data.data.order.delivery_note,
          item_discount_amount: data.data.order.order_discount?.merchant_discount ?? 0,
          foods: data.data.order.order_items.map((item) => ({
            food_id: item.item_id,
            food_name: item.item_name,
            quantity: item.quantity,
            food_price_addition: item.amount,
            price: item.unit_price,
            note: item.note,
            options: JSON.parse(item.customize_json).flatMap((customize) =>
              customize.options.map((option) => ({
                id: option.id,
                name: option.name,
                price: option.price,
                quantity: option.quantity,
              }))
            ),
          })),
        };

        return new ResponseData(HttpStatus.OK, "SUCCESS", result);
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message =
        error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

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
      let body = {};

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

      const headers = {
        "Content-Type": "application/json",
      };

      const data = await axios.post(url, JSON.stringify(body), { headers });

      if (data.data.code == 143) {
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          jwt: !data.data.token ? "" : data.data.token,
        });
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {
          jwt: "",
        });
      }
    } catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message =
        error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

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
