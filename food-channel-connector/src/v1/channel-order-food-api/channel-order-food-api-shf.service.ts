// channel-order-food-api.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { UtilsBaseFunction } from 'src/utils.common/utils.base-function.commom/utils.base-function.comom';
import { ChannelOrderFoodApiEnum } from 'src/utils.common/utils.enum.common/utils.channel-order-food-api.enum';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';

const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

@Injectable()
export class ChannelOrderFoodApiSHFService {
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

  // -------------------------------- SHF --------------------------------
  /**
   * Tạo headers chung cho các request SHF
   * @param options - Các tùy chọn headers
   * @returns Object headers hoàn chỉnh
   */
  private async buildSHFHeaders(options?: {
    access_token?: string;
    x_foody_entity_id?: number;
    x_merchant_token?: string;
    contentType?: boolean;
  }): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'x-sap-ri': UtilsBaseFunction.createXSapRi(),
      'user-agent': ChannelOrderFoodApiEnum.SHF_USER_AGENT,
      'x-foody-app-type':"1024",
    };

    if (options?.access_token) {
      headers['x-foody-access-token'] = options.access_token;
    }

    if (options?.x_foody_entity_id !== undefined) {
      headers['x-foody-entity-id'] = options.x_foody_entity_id.toString();
    }

    if (options?.x_merchant_token) {
      headers['x-merchant-token'] = options.x_merchant_token;
    }

    if (options?.contentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  /**
   * Tạo header strings từ object headers cho curl command
   */
  private createHeaderStrings(headers: Record<string, string>): string {
    return Object.entries(headers)
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');
  }

  async getSHFFoodList(url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {

      const headers = await UtilsBaseFunction.getHeaderShoppeg();

      const headerStrings = Object.entries(JSON.parse(headers))
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');

      const curlCommand = `curl -s -X GET --location "${url}" \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${x_foody_entity_id}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { catalogs: [] } });

      const catalogs = data.data?.catalogs || [];
      const allDishes = catalogs.reduce((accumulator: any[], catalog: any) => {
        const dishes = (catalog.dishes || []).map((dish: any) => ({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          picture_url: dish.picture_url,
          description: dish.description,
          is_pending: dish.is_pending ? 1 : 0
        }));
        return accumulator.concat(dishes);
      }, []);
      return new ResponseData(HttpStatus.OK, "SUCCESS", allDishes);

    } catch (error: any) {
      console.error('[getSHFFoodList] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi rồi getSHFFoodList";

      return new ResponseData(statusCode, message, []);
    }
  }

  async getSHFFoodToppingList(url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {
      const headers = await UtilsBaseFunction.getHeaderShoppeg();

      const headerStrings = Object.entries(JSON.parse(headers))
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');

      const curlCommand = `curl -s -X GET --location "${url}" \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${x_foody_entity_id}'`;

      const resultRaw = await execAsync(curlCommand);
      const data = this.safeJsonParse(resultRaw.stdout, { data: { option_groups: [] } });

      const result = (data.data?.option_groups || []).map((group: any) => ({
        id: group.id,
        name: (group.name || '').trim(),
        list: (group.options || []).map((option: any) => ({
          id: option.id,
          name: option.name,
          price: option.price,
        }))
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", result);

    } catch (error: any) {
      console.error('[getSHFFoodToppingList] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi rồi getSHFFoodToppingList";

      return new ResponseData(statusCode, message, []);
    }
  }

  async getSHFFoodDetail(dish_id: number, url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {
      const fullUrl = `${url}?dish_id=${dish_id}`;

      const headers = await UtilsBaseFunction.getHeaderShoppeg();

      const headerStrings = Object.entries(JSON.parse(headers))
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');

      const curlCommand = `curl -s -X GET --location "${fullUrl}" \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${x_foody_entity_id}'`;

      const resultRaw = await execAsync(curlCommand);

      const data = this.safeJsonParse(resultRaw.stdout, { data: null });

      if (data.data != null) {
        return {
          id: data.data.dish.id,
          name: data.data.dish.name,
          price: data.data.dish.price,
          picture_url: data.data.dish.picture_url,
          description: data.data.dish.description,
          is_pending: data.data.dish.is_pending
        };
      } {
        return {
          id: 0,
          name: '',
          price: 0,
          picture_url: '',
          description: '',
          is_pending: 0
        };
      }
    } catch (error) {
      return {
        id: 0,
        name: '',
        price: 0,
        picture_url: '',
        description: '',
        is_pending: 0
      };
    }
  }

  async updateSHFFoodPrices(foods: any[], url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {
      const headersObj = await this.buildSHFHeaders({
        access_token,
        x_foody_entity_id,
        contentType: true,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      let countError = 0;

      for (const food of foods) {

        const body = JSON.stringify({
          dish_id: +food.id,
          price: +food.price
        });

        const curlCommand = `curl -s -X POST '${url}' \
          ${headerStrings} \
          --data '${body.replace(/'/g, "'\\''")}'`;

        const result = await execAsync(curlCommand);
        const data = this.safeJsonParse(result.stdout, { code: -1 });

        if (data.code != 0) {
          countError = countError + 1;
          break;
        }
      }
      if (countError > 0) {
        for (const food of foods) {

          const body = JSON.stringify({
            dish_id: +food.id,
            price: +food.orinal_price
          });

          const curlCommand = `curl -s -X POST '${url}' \
            ${headerStrings} \
            --data '${body.replace(/'/g, "'\\''")}'`;

          await execAsync(curlCommand);
        }
      }

      return countError;

    } catch (error) {
      return 1;
    }

  }

  async getSHFBranchList(url: string, x_merchant_token: string): Promise<any> {
    try {
      const headersObj = await this.buildSHFHeaders({
        x_merchant_token,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      const body = JSON.stringify({
        page_size: 999999
      });

      const curlCommand = `curl -s -X POST '${url}' \
        ${headerStrings} \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { error_code: 0, data: { store_list: [] } });

      if(data.error_code == 10007){
        return new ResponseData(HttpStatus.UNAUTHORIZED, "Vui lòng cập nhập token cho app SHF", []);

      }else {
        const storeList = data.data?.store_list || [];

          const allBranches = storeList.map((store: any) => ({
          merchant_id : '0',
          branch_id: store.store_id,
          branch_name: store.store_name,
        }));
        return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);
      }


    } catch (error: any) {
      console.error('[getSHFBranchList] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi rồi getSHFBranchList";

      return new ResponseData(statusCode, message, []);
    }

  }

  async getSHFBillNewList(url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {
      const headersObj = await this.buildSHFHeaders({
        access_token,
        x_foody_entity_id,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      const body = JSON.stringify({
        "order_filter_type": 31,
        "next_item_id": "",
        "request_count": 500000,
        "sort_type": 5
      });

      const curlCommand = `curl -s -X POST '${url}' \
        ${headerStrings} \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { orders: [] } });

      const orders = (data.data?.orders || []).map((o: any) => ({
        order_id: o.id,
        order_code: o.code,
        total_amount: o.total_value_amount,
        discount_amount : o.commission?.amount || 0,
        order_amount : o.order_value_amount ,
        customer_order_amount : o.customer_bill?.total_amount || 0,
        customer_discount_amount : o.customer_bill?.total_discount || 0,
        created_at: o.order_time,
        order_status: o.order_status,
        driver_name: o.assignee?.name || '',
        driver_avatar: o.assignee?.avatar_url || '',
        foods:
          (o.order_items || []).map((f: any) => ({
            food_id: f.dish?.id || 0,
            price: f.dish?.original_price || 0,
            food_price_addition : f.original_price || 0,
            food_name: f.dish?.name || '',
            quantity: f.quantity,
            note : !f.note ? '' : f.note,
            options : (f.options_groups || []).flatMap((group: any) =>
                  (group.options || []).map((option: any) => ({
                  name: option.name,
                  price : option.original_price,
                  quantity: option.quantity
              })))
          }))

      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {
      console.error('[getSHFBillNewList] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getSHFBillNewList";

      return new ResponseData(statusCode, message, []);

    }

  }

  async getSHFBillHistoryList(url: string, access_token: string, x_foody_entity_id: number): Promise<any> {
    try {
      const headersObj = await this.buildSHFHeaders({
        access_token,
        x_foody_entity_id,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const timestampStartOfDay = Math.floor(startOfDay.getTime() / 1000);

      const body = JSON.stringify({
        "order_filter_type": 40,
        "next_item_id": "",
        "request_count": 10000,
        "from_time": timestampStartOfDay,
        "to_time": (timestampStartOfDay + 86399),
        "sort_type": 12
      });

      const curlCommand = `curl -s -X POST '${url}' \
        ${headerStrings} \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { orders: [] } });

      const orders = (data.data?.orders || []).map((o: any) => ({
        order_id: o.id,
        order_status: o.order_status
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {
      console.error('[getSHFBillHistoryList] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getSHFBillHistoryList";

      return new ResponseData(statusCode, message, []);
    }
  }

  async getSHFBillDetail(url: string, access_token: string, x_foody_entity_id: number , order_id : string , order_code : string): Promise<any> {
    try {
      const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;
      const headersObj = await this.buildSHFHeaders({
        access_token,
        x_foody_entity_id,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      const curlCommand = `curl -s -X GET '${fullUrl}' \
        ${headerStrings}`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { order: null } });

      const info = data.data?.order;

      if (!info) {
        return new ResponseData(HttpStatus.BAD_REQUEST, "Order not found", {});
      }

      return new ResponseData(HttpStatus.OK, "SUCCESS", {
                                                          order_id: info.id,
                                                          order_code : info.code,
                                                          customer_phone : !info.order_user?.phone ? '' : info.order_user.phone,
                                                          customer_name : !info.order_user?.name ? '' : info.order_user.name,
                                                          customer_address : !info.deliver_address?.address ? '' : info.deliver_address.address
                                                        });

    } catch (error: any) {
      console.error('[getSHFBillDetail] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getSHFBillDetail";

      return new ResponseData(statusCode, message, {});
    }
  }


  async getSHFBillDetailUpdateStatus(url: string, access_token: string, x_foody_entity_id: number , order_id : string , order_code : string): Promise<any> {
    try {
      const fullUrl = `${url}?order_id=${order_id}&order_code=${order_code}`;
      const headersObj = await this.buildSHFHeaders({
        access_token,
        x_foody_entity_id,
      });

      const headerStrings = this.createHeaderStrings(headersObj);

      const curlCommand = `curl -s -X GET '${fullUrl}' \
        ${headerStrings}`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: { order: null } });

      const info = data.data?.order;

      if (!info) {
        return new ResponseData(HttpStatus.BAD_REQUEST, "Order not found", {});
      }

      return new ResponseData(HttpStatus.OK, "SUCCESS", {
                                                          order_id: info.id,
                                                          order_status: info.order_status
                                                        });

    } catch (error: any) {
      console.error('[getSHFBillDetailUpdateStatus] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! getSHFBillDetailUpdateStatus";

      return new ResponseData(statusCode, message, {});
    }
  }

  async confirmSHFBill(url: string, access_token: string, x_foody_entity_id: number , order_id : string ): Promise<any> {
    try {

      const headers = await UtilsBaseFunction.getHeaderShoppeg();

      const headerStrings = Object.entries(JSON.parse(headers))
      .map(([key, value]) => `--header '${key}: ${value}'`)
      .join(' \\\n  ');

      const curlCommand = `curl -s -X POST --location "${url}" \
      ${headerStrings} \
      --header 'x-foody-access-token: ${access_token}' \
      --header 'x-foody-entity-id: ${x_foody_entity_id}' \
      --data '{
        "order_id": ${order_id}
      }'`;

      const resultRaw = await execAsync(curlCommand);

      const result = this.safeJsonParse(resultRaw.stdout, { code: -1, msg: '' });

      return new ResponseData( result.code == 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST, result.msg || (result.code == 0 ? "SUCCESS" : "Error"));
    } catch (error: any) {
      console.error('[confirmSHFBill] Error:', error.message);
      const statusCode = HttpStatus.BAD_REQUEST;
      const message = error.message || "Lỗi ! confirmSHFBill";

      return new ResponseData(statusCode, message, []);

    }

  }

  // -------------------------------- SHF --------------------------------

}
