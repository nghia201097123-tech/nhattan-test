import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';

@Injectable()
export class ChannelOrderFoodApiGRFService {
  constructor(
    private readonly httpService: HttpService

  ) { }

  // -------------------------------- GRF --------------------------------


  async getGRFFoodList(url: string, access_token: string): Promise<any> {
    try {



      const headers = {
        'Authorization': access_token
      };

      const data = await lastValueFrom(this.httpService.get(url, { headers }));

      const catalogs = data.data.categories;

      let allItems = [];

      catalogs.forEach((category) => {
        allItems = allItems.concat(category.items);
      });

      const foods = allItems.map((item) => ({
        id: item.itemID,
        name: item.itemName,
        price: item.priceInMin,
        picture_url: item.imageURL,
        description: item.description,
        is_pending: 0
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", foods);
    } catch (error) {
      return new ResponseData(error.response.status, error.response.statusText, []);
    }

  }

  async getGRFFoodToppingList(url: string, access_token: string): Promise<any> {
    try {



      const headers = {
        'Authorization': access_token
      };

      const data = await lastValueFrom(this.httpService.get(url, { headers }));

      const foodToppings = data.data.modifierGroups.map(group => ({
        id: group.modifierGroupID,
        name: group.modifierGroupName,
        list: group.modifiers.map(option => ({
          id: option.modifierID,
          name: option.modifierName,
          price: isNaN(parseFloat(option.priceDisplay.replace(/\./g, ''))) ? 0 : parseFloat(option.priceDisplay.replace(/\./g, ''))
        }))
      }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", foodToppings);
    } catch (error) {
      return new ResponseData(error.response.status, error.response.statusText, []);
    }

  }


  async getGRFNewOrderList(url: string, access_token: string): Promise<any> {

    try {


      const headers = {
        'Authorization': access_token
      };

      const data = await lastValueFrom(this.httpService.get(url, { headers }));

      const orders = data.data.orders
        .map(o => ({
          order_id: o.orderID,
          order_amount: parseFloat(o.orderValue.replace(/\./g, '')),
          status_string: o.state,
          created_at: o.times.createdAt.replace('T', ' ').replace('Z', ''),
          driver_name: o.driver.name,
          driver_avatar: o.driver.avatar,
          display_id: o.displayID
        }));

      return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
    } catch (error) {

      return new ResponseData(error.response.status, error.response.statusText, []);
    }
  }

  async loginGRF(url: string, usernamne: string, password: string, device_id: string, device_brand: string): Promise<any> {
    try {

      const headers = {
        "Content-Type": "application/json",
        "user-agent": "Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)",
        "mex-country": "VN",
        "x-currency": "VND"
      }

      const body = {
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
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.data.code === 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            device_id: !data.data.data.active_session ? device_id : !data.data.data.active_session.mobile_session_data ? device_id : data.data.data.active_session.mobile_session_data.device_id,
            device_brand: !data.data.data.active_session ? device_brand : !data.data.data.active_session.mobile_session_data ? device_brand : data.data.data.active_session.mobile_session_data.device_brand,
            jwt: !data.data.data.data ? "" : data.data.data.data.jwt,

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
    catch (error) {

      return new ResponseData(
        error.response.status,
        error.response.statusText,
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

      const headers = {
        "Content-Type": "application/json",
        "user-agent": "Grab Merchant/4.126.0 (ios 16.7.10; Build 102734851)",
        "mex-country": "VN",
        "x-currency": "VND"
      }

      const body = {
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
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.data.code === 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            device_id: "",
            device_brand: "",
            jwt: !data.data.data.data ? "" : data.data.data.data.jwt,

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
    catch (error) {

      return new ResponseData(
        error.response.status,
        error.response.statusText,
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

      const headers = {
        'x-mts-ssid': access_token
      };

      const body = {
        "deviceInfo": {
          "UType": "foodmax",
          "DevBrand": device_brand,
          "DevUDID": device_id,
          "DevModel": device_brand
        }
      };

      const data = await lastValueFrom(this.httpService.post(url, body, { headers }));

      if (data.status == 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            message: data.data.message
          }
        );
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
          {
            message: data.data.message
          }
        );
      }
    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        {
          message: ""
        }
      );
    }

  }

  async getGRFBranchDetail(url: string, access_token: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
        'x-mts-ssid': access_token,
        'x-user-type': 'user-profile'
      };

      const data = await lastValueFrom(this.httpService.get(url, { headers }));

      if (data.status == 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          { name: data.data.data.grab_food_profile.merchant.name }
        );
      } else {
        return new ResponseData(
          HttpStatus.OK,
          "BAD REQUEST",
          { name: "" }
        )
      }
    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        { name: "" }
      );
    }
  }

  async getGRFOrderDetailUpdateStatus(url: string, access_token: string, order_id: string): Promise<any> {
    try {


      const headers = {
        'Authorization': access_token
      };
      const fullUrl = `${url}/${order_id}`;

      const data = await lastValueFrom(this.httpService.get(fullUrl, { headers }));

      const order = data.data.order;

      return new ResponseData(
        HttpStatus.OK,
        "SUCCESS",
        {
          order_id: order.orderID,
          order_status: order.state
        });

    }
    catch (error) {

      return new ResponseData(
        error.response.status,
        error.response.statusText,
        {
          order_id: 0,
          order_status: ''
        });
    }

  }

  async confirmGRFBill(url: string, access_token: string, order_id: string): Promise<any> {
    try {
      const headers = {
        'Authorization': access_token,
        'Content-Type': 'application/json',
      };

      const body = {
        orderIDs: [order_id],
        markStatus: 1
      };

      const data = await lastValueFrom(this.httpService.post(url, body, { headers }));

      if (data.data?.reason ?? '' == '') {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS"
        );
      } else {
        return new ResponseData(
          HttpStatus.BAD_REQUEST,
          data.data.message
        );
      }
    }
    catch (error) {
      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data.message || error.response?.statusText;

      return new ResponseData(statusCode, message, {});

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
      const headers = {
        'x-mts-ssid': access_token,
        'Content-Type': 'application/json',
      };

      const body = {
        date_from: from_date,
        date_to: to_date
      };

      const data = await lastValueFrom(this.httpService.post(url, body, { headers }));

      if (data.status == 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            net_sales: data.data.data.net_sales,
            net_total: data.data.data.net_total,
            total_orders: data.data.data.total_orders,
            breakdown_by_category: JSON.stringify(data.data.data.breakdown_by_category.map(o => ({
              type: o.type,
              order_for_sorting: o.order_for_sorting,
              net_total: o.net_total,
              content: o.content?.localized ?? '',
              channel_branch_id: channel_branch_id,
              channel_branch_name: channel_branch_name,
              channel_branch_address: channel_branch_address,
              channel_branch_phone: channel_branch_phone,
              breakdown: (o.breakdown ?? []).filter(a => a.value != 0).map(b => ({
                order_for_sorting: b.order_for_sorting,
                content: b.content?.localized ?? '',
                value: b.value,
                count: b.count,
                tooltip: b.tooltip?.localized ?? '',
                breakdown: (b.breakdown ?? []).filter(c => c.value != 0).map(d => ({
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
    catch (error) {

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data.message || error.response?.statusText;

      return new ResponseData(statusCode, message, {
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
      const headers = {
        'x-mts-ssid': access_token,
        'Content-Type': 'application/json'
      };

      const body = {
        filters : {
          dateTime : {
            "from": from_date,
            "to": to_date,
            "frequency": "monthly"
          }
        }
        // date_from: from_date,
        // date_to: to_date
      };

      const data = await lastValueFrom(this.httpService.post(url, body, { headers }));      

      if (data.status == 200) {
        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            net_sales: this.parseCurrencyToNumber(data.data.data.salesBalance),
            net_total: this.parseCurrencyToNumber(data.data.data.earningsBalance),
            total_orders: 0,
            breakdown_by_category: JSON.stringify(data.data.data.uiBreakdown?.map(o => ({
              type: o.uiBreakdown[0].label == 'Marketing' ? "advertisement" : "grabfood",
              order_for_sorting: o.uiBreakdown[0].label == 'Marketing' ? 1 : 0,
              net_total: this.parseCurrencyToNumber(o.uiBreakdown[0].label == 'Marketing' ? o.uiBreakdown[o.uiBreakdown.length-1].uiBreakdown[0].value.value : data.data.data.earningsBalance),
              content: o.uiBreakdown[0].label == 'Marketing' ? "Marketing" : "GrabFood",
              channel_branch_id: channel_branch_id,
              channel_branch_name: channel_branch_name,
              channel_branch_address: channel_branch_address,
              channel_branch_phone: channel_branch_phone,
              breakdown: (o.uiBreakdown ?? []).filter(a => !a.action).map(b => ({
                order_for_sorting: 0,
                content: b.label ?? '',
                value: b.value ? this.parseCurrencyToNumber(b.value.value) : this.parseCurrencyToNumber(b.uiBreakdown[0]?.value?.value || 0),
                count: 0,
                tooltip: '',
                breakdown: (b.uiBreakdown ?? []).filter(c => !c.value).map(d => ({
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
    catch (error) {      

      const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
      const message = error.response?.data.message || error.response?.statusText;

      return new ResponseData(statusCode, message, {
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
