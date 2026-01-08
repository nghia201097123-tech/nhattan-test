import { HttpStatus } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { ResponseListData } from "src/utils.common/utils.response.common/utils.list.response.common";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { SyncChannelOrderInterface } from "src/v1/interface-class/sync-channel-order";
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

export class SyncChannelOrderShfService implements SyncChannelOrderInterface {
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultHeaders: Record<string, string>;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000, // 30 seconds timeout
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
    });

    this.defaultHeaders = {
      'user-agent' : ChannelOrderFoodApiEnum.SHF_USER_AGENT,
      'x-foody-app-type':"1024",

    };
  }

  private createHeaders(access_token: string, channel_branch_id: string, x_sap_ri: string) {
    return {
      ...this.defaultHeaders,
      "x-foody-access-token": access_token,
      "x-foody-entity-id": +channel_branch_id,
      "x-sap-ri": x_sap_ri,
    };
  }

  

  private mapOrderData(o: any) {
    return {
      order_id: o.id ?? "",
      order_code: o.code ?? "",
      total_amount: o.total_value_amount ?? 0,
      discount_amount: o.commission?.amount ?? 0,
      order_amount: o.order_value_amount ?? 0,
      customer_order_amount: o.customer_bill?.total_amount ?? 0,
      customer_discount_amount: o.customer_bill?.total_discount ?? 0,
      delivery_amount: o.customer_bill?.shipping_fee ?? 0,
      small_order_amount: o.customer_bill?.small_order_fee ?? 0,
      bad_weather_amount: o.customer_bill?.bad_weather_fee ?? 0,
      order_status: o.order_status ?? 0,
      driver_name: o.assignee?.name ?? "",
      driver_avatar: o.assignee?.avatar_url ?? "",
      driver_phone: o.assignee?.phone ?? "",
      note: o.notes?.order_note ?? "",
      item_discount_amount: o?.merchant_discounts?.reduce(
        (sum: number, discount: any) => sum + discount.amount,
        0
      ) ?? 0,
      deliver_time: o.deliver_time ?? "",
      is_scheduled_order: o.scheduled ? 1 : 0,
      customer_phone: o.order_user?.phone ?? "",
      customer_name: o.order_user?.name ?? "",
      customer_address: o.deliver_address?.address ?? "",
      foods: o.order_items.map((f: any) => ({
        food_id: f.dish?.id ?? "",
        price: !(f.dish?.has_promotion ?? false ) ? f.dish?.discount_price : f.dish?.original_price,
        food_price_addition: !(f?.has_promotion ?? false ) ? f?.discount_price : f?.original_price,
        food_name: f.dish?.name ?? "",
        quantity: f.quantity ?? 0,
        note: f.note ?? "",
        options: f.options_groups.flatMap((group: any) =>
          group.options.map((option: any) => ({
            id: option.id ?? 0,
            name: option.name ?? "",
            price: option.discount_price ?? 0,
            quantity: option.quantity ?? 0,
          }))
        ),
      })),
    };
  }

  async getOrders(
    url: string,
    access_token: string,
    channel_branch_id: string,
    x_sap_ri: string
  ): Promise<ResponseListData> {
    try {
      const headers = this.createHeaders(access_token, channel_branch_id, x_sap_ri);
      
      // Chạy song song cả 2 request để tăng tốc độ
      const [newOrdersResponse, waitingOrdersResponse] = await Promise.all([
        this.axiosInstance.post(
          url,
          {
            order_filter_type: 31,
            next_item_id: "",
            request_count: 500000,
            sort_type: 5,
          },
          { headers }
        ),
        this.axiosInstance.post(
          url,
          {
            next_item_id: "",
            request_count: 500000,
            sort_type: 5,
            order_filter_type: 10,
          },
          { headers }
        ),
      ]);

      const orders = [
        ...newOrdersResponse.data.data.orders.map(this.mapOrderData),
        ...waitingOrdersResponse.data.data.orders.map(this.mapOrderData),
      ];

      return new ResponseListData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";
      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrdersV2(
    url: string,
    access_token: string,
    channel_branch_id: string,
    x_sap_ri: string,
    headers : string
  ): Promise<ResponseListData> {
    try {
      // const headers = this.createHeaders(access_token, channel_branch_id, x_sap_ri);

      // --header 'user-agent: language=vi app_type=29' \
      // --header 'x-foody-app-type: 1024' \
      // --header 'Content-Type: application/json' \

      // const headers = await UtilsBaseFunction.getHeaderShoppeg();
      // const headers = {
      //   ...defaultHeaders,
      //   'x-foody-access-token': accessToken,
      //   'x-foody-entity-id': channelBranchId,
      // };
    
      const headerStrings = Object.entries(JSON.parse(headers))
        .map(([key, value]) => `--header '${key}: ${value}'`)
        .join(' \\\n  ');
            
      const curlCommandNewOrder = `curl -X POST --location ${url} \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${channel_branch_id}' \
      --data '{
        "order_filter_type": 31,
        "next_item_id": "",
        "request_count": 50,
        "sort_type": 5
      }'`;
      
      const curlCommandWaitingOrder = `curl -X POST --location ${url} \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${channel_branch_id}' \
      --data '{
        "order_filter_type": 10,
        "next_item_id": "",
        "request_count": 50,
        "sort_type": 5
      }'`;

      const [resultNewOrder, resultWaitingOrder] = await Promise.all([
        execAsync(curlCommandNewOrder),
        await execAsync(curlCommandWaitingOrder)
      ]);

      const orders = [
        ...JSON.parse(resultNewOrder.stdout).data.orders.map(this.mapOrderData),
        ...JSON.parse(resultWaitingOrder.stdout).data.orders.map(this.mapOrderData),
      ];
                            
      return new ResponseListData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {    
                
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillNewList";

      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderHistories(
    url: string,
    access_token: string,
    channel_branch_id: string,
    x_sap_ri: string
  ): Promise<ResponseListData> {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const timestampStartOfDay = Math.floor(startOfDay.getTime() / 1000);

      const headers = this.createHeaders(access_token, channel_branch_id, x_sap_ri);
      
      const { data } = await this.axiosInstance.post(
        url,
        {
          order_filter_type: 40,
          next_item_id: "",
          request_count: 30,
          from_time: timestampStartOfDay,
          to_time: timestampStartOfDay + 86399,
          sort_type: 12,
        },
        { headers }
      );

      const orders = data.data.orders.map((o: any) => ({
        order_id: o.id,
        order_status: o.order_status,
        driver_name: o.assignee?.name ?? "",
        driver_phone: o.assignee?.phone ?? "",
      }));

      return new ResponseListData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";
      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderHistoriesV2(
    url: string,
    access_token: string,
    channel_branch_id: string,
    x_sap_ri: string,
    headers : string
  ): Promise<ResponseListData> {
    try {

      const headerStrings = Object.entries(JSON.parse(headers))
        .map(([key, value]) => `--header '${key}: ${value}'`)
        .join(' \\\n  ');

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const timestampStartOfDay = Math.floor(startOfDay.getTime() / 1000);      

      const curlCommand = `curl -X POST --location ${url} \
      ${headerStrings} \
      --header 'x-foody-entity-id: ${channel_branch_id}' \
      --header 'x-foody-access-token: ${access_token}' \
      --data '{
        "order_filter_type": 40,
        "next_item_id": "",
        "request_count": 30,
        "from_time": ${timestampStartOfDay},
        "to_time": ${timestampStartOfDay + 86399},
        "sort_type": 12
      }'`;

      const result = await execAsync(curlCommand);

      const orders = JSON.parse(result.stdout).data.orders.map((o: any) => ({
        order_id: o.id,
        order_status: o.order_status,
        driver_name: o.assignee?.name ?? "",
        driver_phone: o.assignee?.phone ?? "",
      }));
                  
      return new ResponseListData(HttpStatus.OK, "SUCCESS", orders);

    } catch (error: any) {

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";
      return new ResponseListData(statusCode, message, []);
    }
  }

  async getOrderDetail(
    url: string,
    access_token: string,
    order_id: string,
    order_code: string,
    channel_branch_id: string,
    x_sap_ri: string
  ): Promise<ResponseData> {
    try {
      const headers = this.createHeaders(access_token, channel_branch_id, x_sap_ri);
      const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;

      const { data } = await this.axiosInstance.get(fullUrl, { headers });
      const info = data.data.order;

      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        order_id: info.id,
        order_code: info.code,
        customer_phone: info.order_user.phone ?? "",
        customer_name: info.order_user.name ?? "",
        customer_address: info.deliver_address.address ?? "",
      });
    } catch (error: any) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";
      return new ResponseData(statusCode, message, {});
    }
  }

  async getOrderDetailV2(
    url: string,
    access_token: string,
    order_id: string,
    order_code: string,
    channel_branch_id: string,
    x_sap_ri: string,
    headers : string
  ): Promise<ResponseData> {
    try {

      const headerStrings = Object.entries(JSON.parse(headers))
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');

      const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;

      const curlCommand = `curl -X GET --location "${fullUrl}" \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${channel_branch_id}'`;

      const result = await execAsync(curlCommand);
      const info = JSON.parse(result.stdout).data.order;
      
      return new ResponseData(HttpStatus.OK, "SUCCESS", {
        order_id: info.id,
        order_code: info.code,
        customer_phone: info.order_user?.phone ?? "",
        customer_name: info.order_user?.name ?? "",
        customer_address: info.deliver_address?.address ?? "",
      });
    } catch (error: any) {    
            
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";
      return new ResponseData(statusCode, message, {});
    }
  }
}
