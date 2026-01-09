import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
const { exec } = require("child_process");
import { promisify } from 'util';
const execAsync = promisify(exec);

@Injectable()
export class ChannelOrderFoodApiGRFService {
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

  // -------------------------------- GRF --------------------------------


  async getGRFFoodList(url: string, access_token: string): Promise<any> {
    try {

      const curlCommand = `curl -s -X GET '${url}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { categories: [] });

      const catalogs = data.categories || [];

      let allItems: any[] = [];

      catalogs.forEach((category: any) => {
        allItems = allItems.concat(category.items || []);
      });

      const foods = allItems.map((item: any) => ({
        id: item.itemID,
        name: item.itemName,
        price: item.priceInMin,
        picture_url: item.imageURL,
        description: item.description,
        is_pending: 0
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", foods);
    } catch (error: any) {
      console.error('[getGRFFoodList] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! getGRFFoodList", []);
    }

  }

  async getGRFFoodToppingList(url: string, access_token: string): Promise<any> {
    try {

      const curlCommand = `curl -s -X GET '${url}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { modifierGroups: [] });

      const foodToppings = (data.modifierGroups || []).map((group: any) => ({
        id: group.modifierGroupID,
        name: group.modifierGroupName,
        list: (group.modifiers || []).map((option: any) => ({
          id: option.modifierID,
          name: option.modifierName,
          price: isNaN(parseFloat(option.priceDisplay?.replace(/\./g, ''))) ? 0 : parseFloat(option.priceDisplay.replace(/\./g, ''))
        }))
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", foodToppings);
    } catch (error: any) {
      console.error('[getGRFFoodToppingList] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! getGRFFoodToppingList", []);
    }

  }


  async getGRFNewOrderList(url: string, access_token: string): Promise<any> {

    try {

      const curlCommand = `curl -s -X GET '${url}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { orders: [] });

      const orders = (data.orders || [])
        .map((o: any) => ({
          order_id: o.orderID,
          order_amount: parseFloat((o.orderValue || '0').replace(/\./g, '')),
          status_string: o.state,
          created_at: (o.times?.createdAt || '').replace('T', ' ').replace('Z', ''),
          driver_name: o.driver?.name || '',
          driver_avatar: o.driver?.avatar || '',
          display_id: o.displayID
        }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error: any) {
      console.error('[getGRFNewOrderList] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! getGRFNewOrderList", []);
    }
  }

  async loginGRF(url: string, usernamne: string, password: string, device_id: string, device_brand: string): Promise<any> {
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

      if (data.data?.code === 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            device_id: !data.data.active_session ? device_id : !data.data.active_session.mobile_session_data ? device_id : data.data.active_session.mobile_session_data.device_id,
            device_brand: !data.data.active_session ? device_brand : !data.data.active_session.mobile_session_data ? device_brand : data.data.active_session.mobile_session_data.device_brand,
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
          });
      }
    }
    catch (error: any) {
      console.error('[loginGRF] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! loginGRF",
        {
          device_id: device_id,
          device_brand: device_brand,
          jwt: "",
        }
      );
    }

  }

  async logoutGRF(url: string, usernamne: string, password: string): Promise<any> {
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
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
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
          });
      }
    }
    catch (error: any) {
      console.error('[logoutGRF] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! logoutGRF",
        {
          device_id: "",
          device_brand: "",
          jwt: "",
        }
      );
    }

  }

  async updateGRFDeviceInfor(url: string, access_token: string, device_id: string, device_brand: string): Promise<any> {
    try {

      const body = JSON.stringify({
        "deviceInfo": {
          "UType": "foodmax",
          "DevBrand": device_brand,
          "DevUDID": device_id,
          "DevModel": device_brand
        }
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'x-mts-ssid: ${access_token}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { message: '' });

      // Assuming success if we got a response
      return new ResponseData(
        HttpStatus.OK,
        "SUCCESS",
        {
          message: data.message || ''
        }
      );
    }
    catch (error: any) {
      console.error('[updateGRFDeviceInfor] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! updateGRFDeviceInfor",
        {
          message: ""
        }
      );
    }

  }

  async getGRFBranchDetail(url: string, access_token: string): Promise<any> {
    try {

      const curlCommand = `curl -s -X GET '${url}' \
        --header 'Content-Type: application/json' \
        --header 'x-mts-ssid: ${access_token}' \
        --header 'x-user-type: user-profile'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { data: null });

      if (data.data?.grab_food_profile?.merchant?.name) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          { name: data.data.grab_food_profile.merchant.name }
        );
      } else {
        return new ResponseData(
          HttpStatus.OK,
          "BAD REQUEST",
          { name: "" }
        )
      }
    }
    catch (error: any) {
      console.error('[getGRFBranchDetail] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getGRFBranchDetail",
        { name: "" }
      );
    }
  }

  async getGRFOrderDetailUpdateStatus(url: string, access_token: string, order_id: string): Promise<any> {
    try {

      const fullUrl = `${url}/${order_id}`;

      const curlCommand = `curl -s -X GET '${fullUrl}' \
        --header 'Authorization: ${access_token}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { order: null });

      const order = data.order;

      if (!order) {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "Order not found",
          {
            order_id: 0,
            order_status: ''
          });
      }

      return new ResponseData(
        HttpStatus.OK,
        "SUCCESS",
        {
          order_id: order.orderID,
          order_status: order.state
        });

    }
    catch (error: any) {
      console.error('[getGRFOrderDetailUpdateStatus] Error:', error.message);
      return new ResponseData(
        HttpStatus.BAD_REQUEST,
        error.message || "Lỗi ! getGRFOrderDetailUpdateStatus",
        {
          order_id: 0,
          order_status: ''
        });
    }

  }

  async confirmGRFBill(url: string, access_token: string, order_id: string): Promise<any> {
    try {
      const body = JSON.stringify({
        orderIDs: [order_id],
        markStatus: 1
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'Authorization: ${access_token}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const data = this.safeJsonParse(result.stdout, { reason: '', message: '' });

      if ((data.reason ?? '') == '') {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS"
        );
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          data.message || "Error"
        );
      }
    }
    catch (error: any) {
      console.error('[confirmGRFBill] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! confirmGRFBill", {});

    }

  }

  async getEarningSumaryReport(
    url: string,
    access_token: string,
    from_date: string,
    to_date: string,
    channel_branch_id: number,
    channel_branch_name: string,
    channel_branch_address: string,
    channel_branch_phone: string

  ): Promise<any> {
    try {
      const body = JSON.stringify({
        date_from: from_date,
        date_to: to_date
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'x-mts-ssid: ${access_token}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const responseData = this.safeJsonParse(result.stdout, { data: null });

      if (responseData.data) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            net_sales: responseData.data.net_sales,
            net_total: responseData.data.net_total,
            total_orders: responseData.data.total_orders,
            breakdown_by_category: JSON.stringify((responseData.data.breakdown_by_category || []).map((o: any) => ({
              type: o.type,
              order_for_sorting: o.order_for_sorting,
              net_total: o.net_total,
              content: o.content?.localized ?? '',
              channel_branch_id: channel_branch_id,
              channel_branch_name: channel_branch_name,
              channel_branch_address: channel_branch_address,
              channel_branch_phone: channel_branch_phone,
              breakdown: (o.breakdown ?? []).filter((a: any) => a.value != 0).map((b: any) => ({
                order_for_sorting: b.order_for_sorting,
                content: b.content?.localized ?? '',
                value: b.value,
                count: b.count,
                tooltip: b.tooltip?.localized ?? '',
                breakdown: (b.breakdown ?? []).filter((c: any) => c.value != 0).map((d: any) => ({
                  order_for_sorting: d.order_for_sorting,
                  content: d.content?.localized ?? '',
                  value: d.value,
                  count: d.count
                }))
              }))
            }))
            )
          }
        );
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "BAD REQUEST",
          {
            net_sales: 0,
            net_total: 0,
            total_orders: 0,
            breakdown_by_category: '[]'
          }
        )
      }
    }
    catch (error: any) {
      console.error('[getEarningSumaryReport] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! getEarningSumaryReport", {
        net_sales: 0,
        net_total: 0,
        total_orders: 0,
        breakdown_by_category: '[]'
      });

    }

  }

  async getEarningSumaryReportV2(
    url: string,
    access_token: string,
    from_date: string,
    to_date: string,
    channel_branch_id: number,
    channel_branch_name: string,
    channel_branch_address: string,
    channel_branch_phone: string

  ): Promise<any> {
    try {
      const body = JSON.stringify({
        filters : {
          dateTime : {
            "from": from_date,
            "to": to_date,
            "frequency": "monthly"
          }
        }
      });

      const curlCommand = `curl -s -X POST '${url}' \
        --header 'x-mts-ssid: ${access_token}' \
        --header 'Content-Type: application/json' \
        --data '${body.replace(/'/g, "'\\''")}'`;

      const result = await execAsync(curlCommand);
      const responseData = this.safeJsonParse(result.stdout, { data: null });

      if (responseData.data) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            net_sales: this.parseCurrencyToNumber(responseData.data.salesBalance),
            net_total: this.parseCurrencyToNumber(responseData.data.earningsBalance),
            total_orders: 0,
            breakdown_by_category: JSON.stringify(responseData.data.uiBreakdown?.map((o: any) => ({
              type: o.uiBreakdown[0].label == 'Marketing' ? "advertisement" : "grabfood",
              order_for_sorting: o.uiBreakdown[0].label == 'Marketing' ? 1 : 0,
              net_total: this.parseCurrencyToNumber(o.uiBreakdown[0].label == 'Marketing' ? o.uiBreakdown[o.uiBreakdown.length-1].uiBreakdown[0].value.value : responseData.data.earningsBalance),
              content: o.uiBreakdown[0].label == 'Marketing' ? "Marketing" : "GrabFood",
              channel_branch_id: channel_branch_id,
              channel_branch_name: channel_branch_name,
              channel_branch_address: channel_branch_address,
              channel_branch_phone: channel_branch_phone,
              breakdown: (o.uiBreakdown ?? []).filter((a: any) => !a.action).map((b: any) => ({
                order_for_sorting: 0,
                content: b.label ?? '',
                value: b.value ? this.parseCurrencyToNumber(b.value.value) : this.parseCurrencyToNumber(b.uiBreakdown[0]?.value?.value || 0),
                count: 0,
                tooltip: '',
                breakdown: (b.uiBreakdown ?? []).filter((c: any) => !c.value).map((d: any) => ({
                  order_for_sorting: 0,
                  content: d.label ?? '',
                  value: d.value ? this.parseCurrencyToNumber(d.value?.value || 0) : this.parseCurrencyToNumber(d.uiBreakdown[0]?.value?.value || 0),
                  count: d.count
                }))
              }))
            }))
            )
          }
        );
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "BAD REQUEST",
          {
            net_sales: 0,
            net_total: 0,
            total_orders: 0,
            breakdown_by_category: '[]'
          }
        )
      }
    }
    catch (error: any) {
      console.error('[getEarningSumaryReportV2] Error:', error.message);
      return new ResponseData(HttpStatus.BAD_REQUEST, error.message || "Lỗi ! getEarningSumaryReportV2", {
        net_sales: 0,
        net_total: 0,
        total_orders: 0,
        breakdown_by_category: '[]'
      });
    }
  }


  parseCurrencyToNumber(value: string): number{
    if (!value) return 0;

  // Kiểm tra dấu âm
  const isNegative = value.trim().startsWith("-");

  // Loại bỏ mọi ký tự không phải số
  const cleaned = value.replace(/[^\d]/g, "");

  if (!cleaned) return 0;

  const number = parseInt(cleaned, 10);

  return isNegative ? -number : number;
  }

  // -------------------------------- GRF --------------------------------

}
