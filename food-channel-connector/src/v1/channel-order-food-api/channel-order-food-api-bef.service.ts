import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChannelOrderFoodApiBEFService {
  constructor(
    private readonly httpService: HttpService

  ) { }
  // -------------------------------- BEF --------------------------------

  async loginBEF(url: string, usernamne: string, password: string): Promise<any> {
    try {

      let body = {};

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

      const headers = {
        'Content-Type': 'application/json',
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.code == 143) {

        return new ResponseData(
          HttpStatus.OK,
          "SUCCESS",
          {
            jwt: !data.data.token ? "" : data.data.token,
            user_id : data.data?.user?.user_id ?? 0
          });
      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message,{jwt : ""});

      }
    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        {jwt : ""}
      );
    }

  }


  async getBEFBranchList(url: string, access_token: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.code == 143) {

        const allBranches = data.data.data.reduce((accumulator, merchant) => {
          const storeProfiles = merchant.store_profiles.map(store => ({
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
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);

      }

    }
    catch (error) {

      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFFoodList(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.flag == 143) {

        const allBranches = data.data.restaurant_items.reduce((accumulator, merchant) => {
          const storeProfiles = merchant.items.map(item => ({
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
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFFoodListV2(url_get_branch_food_list : string , url_get_branch_info : string , access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body_get_branch_info = {
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      };

      const dataGetBranchInfo = await lastValueFrom(this.httpService.post(url_get_branch_info, JSON.stringify(body_get_branch_info), { headers }));

      if (dataGetBranchInfo.data.flag == 143) {

        const body_get_branch_food_list = {
          access_token: access_token,
          restaurant_id: +channel_branch_id,
          merchant_id: +merchant_id,
          vendor_id : +dataGetBranchInfo.data.store.vendor_id
        };
  
        const data = await lastValueFrom(this.httpService.post(url_get_branch_food_list, JSON.stringify(body_get_branch_food_list), { headers }));
  
        if (data.data.flag == 143) {
  
          const allBranches = data.data.restaurant_items.reduce((accumulator, merchant) => {
            const storeProfiles = merchant.items.map(item => ({
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
          return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
        }
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFFoodToppingList(url_get_branch_food_list : string , url_get_branch_info : string , access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body_get_branch_info = {
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      };

      const dataGetBranchInfo = await lastValueFrom(this.httpService.post(url_get_branch_info, JSON.stringify(body_get_branch_info), { headers }));

      if (dataGetBranchInfo.data.flag == 143) {

        const body_get_branch_food_list = {
          access_token: access_token,
          restaurant_id: +channel_branch_id,
          merchant_id: +merchant_id,
          vendor_id : +dataGetBranchInfo.data.store.vendor_id
        };
  
        const data = await lastValueFrom(this.httpService.post(url_get_branch_food_list, JSON.stringify(body_get_branch_food_list), { headers }));
  
        if (data.data.flag == 143) {
  
            const foodToppings = data.data.item_customizes.map(group => ({
              id: group.customize_id,
              name: group.name,
              list: group.customize_options.map(option => ({
                id: option.option_id,
                name: option.name,
                price: option.price,
              }))
            }));
  
          return new ResponseData(HttpStatus.OK, "SUCCESS", foodToppings);
  
        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
        }
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }


  async getBEFFoodListToCheckBillDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.flag == 143) {

        const allBranches = data.data.restaurant_items.reduce((accumulator, merchant) => {
          const storeProfiles = merchant.items.map(item => ({
            id: item.restaurant_item_id,
            name: item.item_name
          }));
          return accumulator.concat(storeProfiles);
        }, []);

        return new ResponseData(HttpStatus.OK, "SUCCESS", allBranches);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }


  async getBEFFoodDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string, food_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        restaurant_item_id: +food_id
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.flag == 143) {

        const food = {
          id: data.data.restaurant_item.restaurant_item_id,
          name: data.data.restaurant_item.item_name,
          price: data.data.restaurant_item.price,
          picture_url: data.data.restaurant_item.item_image,
          description: data.data.restaurant_item.item_details,
          old_price: data.data.restaurant_item.old_price,
          category_id: data.data.restaurant_item.category_id
        };


        return new ResponseData(HttpStatus.OK, "SUCCESS", food);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {});
      }

    }
    catch (error) {

      return new ResponseData(
        error.response.status,
        error.response.statusText,
        {}
      );

    }

  }


  async updateBEFFoodPrice(url: string, access_token: string, channel_branch_id: string, merchant_id: string, _data: any, newPrice: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };
      const body = {
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
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.flag == 143) {
        return new ResponseData(HttpStatus.OK, "SUCCESS");

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message);
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText
      );

    }

  }

  async getBEFBillListNew(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        fetch_type: "in_progress"
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));      

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
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFBillListHistory(url: string, access_token: string, channel_branch_id: string, merchant_id: string): Promise<any> {
    try {


      const moment = require('moment');

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        page: 1,
        limit: 1000000,
        fetch_type: "previous",
        start_date: moment(new Date).format('YYYY-MM-DD'),
        end_date: moment(new Date).format('YYYY-MM-DD'),
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.code == 143) {

        const bills = data.data.restaurant_orders.map(item => ({
          order_id: item.order_id,
          order_status: item.delivery_status
        }));        

        return new ResponseData(HttpStatus.OK, "SUCCESS", bills);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFBillDetail(url: string, access_token: string, channel_branch_id: string, merchant_id: string, order_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        order_id: +order_id,
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.code == 143) {

        const billDetails = data.data.order.order_items.map(item => ({
          order_id: data.data.order.order_id,
          discount_amount : data.data.order.jugnoo_commission,
          total_amount : data.data.order.net_order_amount,
          customer_order_amount : data.data.order.total_amount,
          customer_discount_amount : !data.data.order.offers ? 0 : [...data.data.order.offers.delivery_discounts, ...data.data.order.offers.food_discounts]
          .reduce((total, discount) => total + discount.discount_value, 0),
          food_id: item.item_id,
          food_name: item.item_name,
          quantity: item.quantity,
          food_price_addition: item.original_amount,
          price: item.unit_price,
          note : item.note,
          customer_name : data.data.order.customer_name,
          customer_phone : !data.data.order.customer_phone_no ? '' : data.data.order.customer_phone_no,
          customer_address : data.data.order.delivery_address,
          options : JSON.parse(item.customize_json).flatMap(customize => 
                  customize.options.map(option => ({
                  name: option.name,
                  price: option.price,
                  quantity : option.quantity 
              }))
          )
        }));                
    
        return new ResponseData(HttpStatus.OK, "SUCCESS", billDetails);

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

  async getBEFBillDetailUpdateStatus(url: string, access_token: string, channel_branch_id: string, merchant_id: string, order_id: string): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body = {
        access_token: access_token,
        restaurant_id: +channel_branch_id,
        merchant_id: +merchant_id,
        order_id: +order_id,
      };

      const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));

      if (data.data.code == 143) {

        const billDetail =  data.data.order;


        return new ResponseData(HttpStatus.OK, "SUCCESS", {
          order_id : billDetail.order_id,
          order_status : billDetail.delivery_status

        });

      } else {
        return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {});
      }

    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        {}
      );

    }

  }

  async comfirmBEFBill(url: string, url_get_branch_info : string ,access_token: string, channel_branch_id: string, merchant_id: string , user_id : number , order_id : number ): Promise<any> {
    try {

      const headers = {
        'Content-Type': 'application/json',
      };

      const body_get_branch_info = {
        access_token: access_token,
        store_id: +channel_branch_id,
        merchant_id: +merchant_id
      };

      const dataGetBranchInfo = await lastValueFrom(this.httpService.post(url_get_branch_info, JSON.stringify(body_get_branch_info), { headers }));

      if (dataGetBranchInfo.data.flag == 143) {

          const body = {
            access_token: access_token,
            restaurant_id: +channel_branch_id,
            merchant_id: +merchant_id,
            user_id : user_id,
            order_id : order_id,
            vendor_id : +dataGetBranchInfo.data.store.vendor_id
          };

          const data = await lastValueFrom(this.httpService.post(url, JSON.stringify(body), { headers }));      

          if (data.data.flag == 143) {
            return new ResponseData(HttpStatus.OK, "SUCCESS");
            }
          else{
            return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message);
          }
        } else {
          return new ResponseData(HttpStatus.BAD_REQUEST, dataGetBranchInfo.data.message);
        }
    }
    catch (error) {
      return new ResponseData(
        error.response.status,
        error.response.statusText,
        []
      );

    }

  }

}
