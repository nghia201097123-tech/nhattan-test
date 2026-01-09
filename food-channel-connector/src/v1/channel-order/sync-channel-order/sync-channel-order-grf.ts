import { HttpStatus } from "@nestjs/common";
import { ResponseListData } from "src/utils.common/utils.response.common/utils.list.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { SyncChannelOrderInterface } from "src/v1/interface-class/sync-channel-order";
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

export class SyncChannelOrderGrfService implements SyncChannelOrderInterface {

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
    access_token: string
  ): Promise<ResponseListData> {
    try {
      const curlCommand = `curl -s -X GET '${url}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { orders: [] });

      return new ResponseListData(
        HttpStatus.OK,
        "SUCCESS",
        (data.orders || []).map((o: any) => ({
          order_id: o.orderID,
          order_amount: parseFloat((o.orderValue || "0").replace(/\./g, "")),
          status_string: o.state,
          driver_name: o.driver?.name || "",
          driver_avatar: o.driver?.avatar || "",
          display_id: o.displayID,
          deliver_time: o.scheduleOrderInfo?.expectedDeliveryTime ?? o.times?.deliveredAt ?? "",
          is_scheduled_order: (o.scheduleOrderInfo?.isScheduledOrder ?? false) ? 1 : 0
        }))
      );
    } catch (error: any) {
      console.error('[getOrders] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getGRFBillNewList";

      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderHistories(
    url: string,
    access_token: string
  ): Promise<ResponseListData> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = yesterday.toISOString().slice(0, 10);

      const params = new URLSearchParams({
        startTime: `${formattedDate}T15:00:00.000Z`,
        endTime: `${new Date().toISOString().slice(0, 11)}23:59:59.999999Z`,
        pageIndex: "0",
        pageSize: "30",
      });

      const fullUrl = `${url}?${params.toString()}`;
      const curlCommand = `curl -s -X GET '${fullUrl}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { statements: [] });

      return new ResponseListData(
        HttpStatus.OK,
        "SUCCESS",
        (data.statements || []).map((o: any) => ({
          order_id: o.ID,
          status_string: o.deliveryStatus,
          display_id: o.displayID,
        }))
      );
    } catch (error: any) {
      console.error('[getOrderHistories] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getGRFBillHistoryList";

      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderDetail(
    url: string,
    access_token: string,
    order_id: string,
    display_id: string
  ): Promise<any> {
    try {
      const fullUrl = `${url}/${order_id}`;
      const curlCommand = `curl -s -X GET '${fullUrl}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { order: null });
      let order = data.order;

      if (!order) {
        return new ResponseData(HttpStatus.NOT_FOUND, "Order not found", {});
      }

      // Hàm helper để parse số từ chuỗi
      const parseNumber = (value: string): number => {
        if (!value) return 0;
        const parsed = parseFloat(value.replace(/\./g, ""));
        return isNaN(parsed) ? 0 : parsed;
      };

      const isorderBookings = !order.orderBookings ? 0 : 1;

      if (isorderBookings == 0) {
        if (display_id == order.displayID) {
          return new ResponseData(HttpStatus.OK, "SUCCESS", {
            order_id: order.orderID,
            customer_order_amount: parseNumber(order.fare?.reducedPriceDisplay),
            customer_discount_amount: parseNumber(order.fare?.promotionDisplay) + parseNumber(order.fare?.totalDiscountAmountDisplay),
            customer_phone: order.eater?.mobileNumber ?? '',
            customer_name: order.eater?.name ?? '',
            customer_address: order.eater?.address?.address ?? '',
            driver_phone: order.driver?.mobileNumber ?? '',
            driver_name: order.driver?.name ?? '',
            delivery_amount: parseNumber(order.fare?.deliveryFeeDisplay),
            small_order_amount: parseNumber(order.fare?.smallOrderFeeDisplay),
            note: order.eater?.comment || "",
            item_discount_amount: parseNumber(order.fare?.totalDiscountAmountDisplay),
            discount_amount: parseNumber(order.fare?.mexCommissionDisplay),
            item_infos: (order.itemInfo?.items || []).map((item: any) => ({
              food_id: item.itemID,
              food_name: item.name,
              quantity: item.quantity,
              food_price_addition: parseNumber(item.fare?.priceDisplay),
              price: parseNumber(item.fare?.originalItemPriceDisplay),
              total_discount_food_price: (!item.discountInfo ? 0 : (item.discountInfo || []).reduce((sum: number, discount: any) => sum + parseNumber(discount.itemDiscountPriceDisplay), 0)),
              note: item.comment,
              discount_infos: !item.discountInfo ? [] : (item.discountInfo || []).map((disc: any) => ({
                discount_food_name: disc.discountName ?? '',
                discount_food_funding: disc.discountFunding ?? '',
                discount_food_price: parseNumber(disc.itemDiscountPriceDisplay),
              })),
              options: (item.modifierGroups || []).flatMap((group: any) =>
                (group.modifiers || []).map((modifier: any) => ({
                  id: modifier.modifierID,
                  name: modifier.modifierName,
                  quantity: 1,
                  price: modifier.priceDisplay ? parseNumber(modifier.priceDisplay) * item.quantity : 0,
                }))
              ),
            })),
          });
        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, "Không khớp mã id ngắn", {});
        }
      } else {
        const orderSub = (order.orderBookings || []).find((x: any) => x.shortOrderID == display_id);
        if (!orderSub) {
          return new ResponseData(HttpStatus.BAD_REQUEST, "Không tìm thấy order booking", {});
        }

        const isOrderSubFirst = order.orderBookings[0].shortOrderID == display_id ? 1 : 0;

        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id: order.orderID,
          customer_order_amount: parseNumber(order.fare?.reducedPriceDisplay),
          customer_discount_amount: parseNumber(order.fare?.promotionDisplay) + parseNumber(order.fare?.totalDiscountAmountDisplay),
          customer_phone: order.eater?.mobileNumber ?? '',
          customer_name: order.eater?.name ?? '',
          customer_address: order.eater?.address?.address ?? '',
          driver_phone: orderSub.driver?.mobileNumber ?? '',
          driver_name: orderSub.driver?.name ?? '',
          delivery_amount: parseNumber(order.fare?.deliveryFeeDisplay),
          small_order_amount: parseNumber(order.fare?.smallOrderFeeDisplay),
          note: order.eater?.comment || "",
          item_discount_amount: parseNumber(order.fare?.totalDiscountAmountDisplay) * (+isOrderSubFirst),
          discount_amount: parseNumber(order.fare?.mexCommissionDisplay),
          item_infos: (orderSub.items?.items || []).map((item: any) => ({
            food_id: item.itemID,
            food_name: item.name,
            quantity: item.quantity,
            food_price_addition: parseNumber(item.fare?.priceDisplay),
            price: parseNumber(item.fare?.originalItemPriceDisplay),
            note: item.comment,
            total_discount_food_price: (!item.discountInfo ? 0 : (item.discountInfo || []).reduce((sum: number, discount: any) => sum + parseNumber(discount.itemDiscountPriceDisplay), 0)),
            discount_infos: !item.discountInfo ? [] : (item.discountInfo || []).map((disc: any) => ({
              discount_food_name: disc.discountName ?? '',
              discount_food_funding: disc.discountFunding ?? '',
              discount_food_price: parseNumber(disc.itemDiscountPriceDisplay),
            })),
            options: (item.modifierGroups || []).flatMap((group: any) =>
              (group.modifiers || []).map((modifier: any) => ({
                id: modifier.modifierID,
                name: modifier.modifierName,
                quantity: 1,
                price: modifier.priceDisplay ? parseNumber(modifier.priceDisplay) * item.quantity : 0,
              }))
            ),
          })),
        });
      }
    } catch (error: any) {
      console.error('[getOrderDetail] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getGRFBillDetail";

      return new ResponseData(statusCode, message, {
        order_id: "",
        customer_order_amount: 0,
        customer_discount_amount: 0,
        customer_phone: "",
        customer_name: "",
        customer_address: "",
        driver_phone: "",
        delivery_amount: 0,
        small_order_amount: 0,
        item_infos: [],
      });
    }
  }

  async getDriverInfo(
    url: string,
    access_token: string,
    order_id: string,
    display_id: string
  ): Promise<any> {
    try {
      const fullUrl = `${url}/${order_id}`;
      const curlCommand = `curl -s -X GET '${fullUrl}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { order: null });
      const order = data.order;

      if (!order) {
        return new ResponseData(HttpStatus.NOT_FOUND, "Order not found", {});
      }

      const isorderBookings = !order.orderBookings ? 0 : 1;

      if (isorderBookings == 0) {
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id: order.orderID,
          driver_phone: order.driver?.mobileNumber ?? '',
          driver_name: order.driver?.name ?? '',
          status_string: order.state,
        });
      } else {
        const orderSub = (order.orderBookings || []).find((x: any) => x.shortOrderID == display_id);

        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id: order.orderID,
          driver_phone: orderSub?.driver?.mobileNumber ?? '',
          driver_name: orderSub?.driver?.name ?? '',
          status_string: orderSub?.state || "",
        });
      }
    } catch (error: any) {
      console.error('[getDriverInfo] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getDriverInfo";

      return new ResponseData(statusCode, message, {
        order_id: "",
        driver_phone: "",
        driver_name: "",
        status_string: ""
      });
    }
  }

  async loginGRF(
    url: string,
    usernamne: string,
    password: string,
    device_id: string,
    device_brand: string
  ): Promise<any> {
    try {
      const body = JSON.stringify({
        login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
        session_data: {
          mobile_session_data: {
            device_model: "iPhone 13",
            device_id: device_id,
            device_brand: device_brand,
          },
        },
        without_force_logout: true,
        password: password,
        username: usernamne,
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --header 'user-agent: Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)' \
        --header 'mex-country: VN' \
        --header 'x-currency: VND' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { code: 0 } });

      if (data.data?.code === HttpStatus.OK) {
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          device_id: !data.data.active_session
            ? device_id
            : !data.data.active_session.mobile_session_data
              ? device_id
              : data.data.active_session.mobile_session_data.device_id,
          device_brand: !data.data.active_session
            ? device_brand
            : !data.data.active_session.mobile_session_data
              ? device_brand
              : data.data.active_session.mobile_session_data.device_brand,
          jwt: !data.data.data ? "" : data.data.data.jwt,
        });
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
          {
            device_id: device_id,
            device_brand: device_brand,
            jwt: "",
          }
        );
      }
    } catch (error: any) {
      console.error('[loginGRF] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! loginGRF";

      return new ResponseData(statusCode, message, {
        device_id: device_id,
        device_brand: device_brand,
        jwt: "",
      });
    }
  }

  async logoutGRF(
    url: string,
    usernamne: string,
    password: string
  ): Promise<any> {
    try {
      const body = JSON.stringify({
        login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
        session_data: {
          mobile_session_data: {
            device_model: "iPhone 13",
            device_id: "",
            device_brand: "",
          },
        },
        without_force_logout: false,
        password: password,
        username: usernamne,
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --header 'user-agent: Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)' \
        --header 'mex-country: VN' \
        --header 'x-currency: VND' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { code: 0 } });

      if (data.data?.code === 200) {
        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          device_id: "",
          device_brand: "",
          jwt: !data.data.data ? "" : data.data.data.jwt,
        });
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
          {
            device_id: "",
            device_brand: "",
            jwt: "",
          }
        );
      }
    } catch (error: any) {
      console.error('[logoutGRF] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! logoutGRF";

      return new ResponseData(statusCode, message, {
        device_id: "",
        device_brand: "",
        jwt: "",
      });
    }
  }

  async updateGRFDeviceInfor(
    url: string,
    access_token: string,
    device_id: string,
    device_brand: string
  ): Promise<any> {
    try {
      const body = JSON.stringify({
        deviceInfo: {
          UType: "foodmax",
          DevBrand: device_brand,
          DevUDID: device_id,
          DevModel: device_brand,
        },
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Content-Type: application/json' \
        --header 'x-mts-ssid: ${access_token}' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { message: "" });

      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        message: data.message || "",
      });
    } catch (error: any) {
      console.error('[updateGRFDeviceInfor] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! updateGRFDeviceInfor";

      return new ResponseData(statusCode, message, {
        message: "",
      });
    }
  }

  async syncTokenGRF(
    url_login: string,
    url_update_device: string,
    usernamne: string,
    password: string,
    device_id: string,
    device_brand: string
  ): Promise<any> {
    let data = await this.loginGRF(
      url_login,
      usernamne,
      password,
      device_id,
      device_brand
    );

    if (
      data.status == HttpStatus.BAD_REQUEST ||
      data.status == HttpStatus.TOO_MANY_REQUESTS
    ) {
      return "";
    }

    if (data.data.jwt == "" || data.data.jwt == null) {
      await delay(2000);
      data = await this.loginGRF(
        url_login,
        usernamne,
        password,
        data.data.device_id,
        data.data.device_brand
      );
    }

    if (
      data.status == HttpStatus.BAD_REQUEST ||
      data.status == HttpStatus.TOO_MANY_REQUESTS
    ) {
      return;
    }

    if (data.data.jwt == "" || data.data.jwt == null) {
      await delay(2000);
      data = await this.logoutGRF(url_login, usernamne, password);

      if (data.status != HttpStatus.OK) {
        return "";
      }

      await this.updateGRFDeviceInfor(
        url_update_device,
        data.data.jwt,
        device_id,
        device_brand
      );
    }

    return data.data.jwt;

    async function delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }
}
