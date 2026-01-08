// import axios from "axios";
// import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
// import { HttpStatus } from "@nestjs/common";
// import { FoodChannelTokenValidatorEntity } from "./entity/food-channel-token-validator.entity";
// import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
// import { ChannelOrderV2 } from "./entity/channel-order-v2.entity";

// export default async function performTask(
//   data : {channelFoodToken: FoodChannelTokenValidatorEntity ,
//           time : string
//           }
// ): Promise<any> {
  
//   let dataChannelOrders: ChannelOrderV2[] = [];
//   let access_token_new: string = "";
  
//   if (data.channelFoodToken.channel_order_food_id === 1) {
//     let dataOld = await getSHFBillHistoryList(
//       data.channelFoodToken.url_get_history_orders ??
//         ChannelOrderFoodApiEnum.SHF_GET_BILL_LIST,
//       data.channelFoodToken.access_token,
//       +data.channelFoodToken.channel_branch_id,
//       data.time
//     );    

//     if (dataOld.status != HttpStatus.OK) {
//       dataChannelOrders = [];
//     } else {
//       dataChannelOrders = new ChannelOrderV2().mapToList(
//         dataOld.data,
//         1,
//         data.channelFoodToken.channel_branch_id,
//         data.channelFoodToken.channel_order_food_token_id
//       );
//     }

//   }

//   if (data.channelFoodToken.channel_order_food_id === 2) {
//     // B1 : Lây danh sách đơn hàng mới và nếu token hết hạn sẽ lấy lại token mới
//     let dataOld = await getGRFOrderList(
//       data.channelFoodToken.url_get_history_orders ??
//         ChannelOrderFoodApiEnum.GRF_GET_ORDER_LIST,
//         data.channelFoodToken.access_token,
//         data.time

//     );

//     if (dataOld.status == HttpStatus.UNAUTHORIZED) {
//       access_token_new = await syncTokenGRF(
//         data.channelFoodToken.url_login ?? ChannelOrderFoodApiEnum.GRF_LOGIN,
//         data.channelFoodToken.url_update_device ??
//           ChannelOrderFoodApiEnum.GRF_UPDATE_DEVICE_INFO,
//           data.channelFoodToken.username,
//           data.channelFoodToken.password,
//           data.channelFoodToken.device_id,
//           data.channelFoodToken.device_brand
//       );

//       dataOld = await getGRFOrderList(
//         data.channelFoodToken.url_get_history_orders ??
//         ChannelOrderFoodApiEnum.GRF_GET_ORDER_LIST,
//         access_token_new,
//         data.time

//       );
//     }

//     if (dataOld.status != HttpStatus.OK) {
//       dataChannelOrders = [];
//     } else {
//       dataChannelOrders = new ChannelOrderV2().mapToList(
//         dataOld.data,
//         2,
//         data.channelFoodToken.channel_branch_id,
//         data.channelFoodToken.channel_order_food_token_id
//       );
//     }

//     // B2 : Cập nhập thông tin khách hàng cho từng đơn hàng mới
//     for (const order of dataChannelOrders) {
//       let dataDetail = await getGRFOrderDetail(
//           data.channelFoodToken.url_get_order_detail ??
//           ChannelOrderFoodApiEnum.GRF_GET_ORDER_DETAIL,
//           data.channelFoodToken.access_token,
//           order.order_id
//       );

//       if (dataDetail.status == HttpStatus.OK) {
//         order.customer_order_amount = dataDetail.data.customer_order_amount;
//         order.customer_discount_amount =
//           dataDetail.data.customer_discount_amount;
//         order.customer_name = dataDetail.data.customer_name;
//         order.customer_phone = dataDetail.data.customer_phone;
//         order.delivery_address = dataDetail.data.customer_address;
//         order.driver_phone = dataDetail.data.driver_phone;
//         order.driver_name = dataDetail.data.driver_name;
//         order.driver_avatar = dataDetail.data.driver_avatar;
//         order.delivery_amount = dataDetail.data.delivery_amount;
//         order.small_order_amount = dataDetail.data.small_order_amount;
//         order.details = JSON.stringify(dataDetail.data.item_infos);
//       }
//     }
//   }

//   if (data.channelFoodToken.channel_order_food_id === 4) {
//     let dataOld = await getBEFBillListHistory(
//       data.channelFoodToken.url_get_history_orders ??
//         ChannelOrderFoodApiEnum.BEF_GET_BILL_LIST,
//         data.channelFoodToken.access_token,
//         data.channelFoodToken.channel_branch_id,
//         data.channelFoodToken.merchant_id,
//         data.time
//     );

//     if (dataOld.status == HttpStatus.UNAUTHORIZED) {
//       access_token_new = await syncTokenBEF(
//         data.channelFoodToken.url_login ?? ChannelOrderFoodApiEnum.BEF_LOGIN,
//         data.channelFoodToken.username,
//         data.channelFoodToken.password
//       );

//       dataOld = await getBEFBillListHistory(
//         data.channelFoodToken.url_get_history_orders ??
//           ChannelOrderFoodApiEnum.BEF_GET_BILL_LIST,
//         access_token_new,
//         data.channelFoodToken.channel_branch_id,
//         data.channelFoodToken.merchant_id,
//         data.time

//       );
//     }

//     if (dataOld.status != HttpStatus.OK) {
//       dataChannelOrders = [];
//     } else {
//       dataChannelOrders = new ChannelOrderV2().mapToList(
//         dataOld.data,
//         4,
//         data.channelFoodToken.channel_branch_id,
//         data.channelFoodToken.channel_order_food_token_id
//       );
//     }

//     for (const order of dataChannelOrders) {
//       let dataDetail = await getBEFBillDetail(
//         data.channelFoodToken.url_get_order_detail ??
//           ChannelOrderFoodApiEnum.BEF_GET_BILL_DETAIL,
//           data.channelFoodToken.access_token,
//           data.channelFoodToken.channel_branch_id,
//           data.channelFoodToken.merchant_id,
//         order.order_id
//       );

//       if (dataDetail.status == HttpStatus.OK) {
//         order.discount_amount = dataDetail.data.discount_amount;
//         order.total_amount = dataDetail.data.total_amount;
//         order.customer_order_amount = dataDetail.data.customer_order_amount;
//         order.customer_discount_amount =
//           dataDetail.data.customer_discount_amount;
//         order.delivery_address = dataDetail.data.customer_address;
//         order.customer_name = dataDetail.data.customer_name;
//         order.customer_phone = dataDetail.data.customer_phone;
//         order.details = JSON.stringify(dataDetail.data.foods);
//       }
//     }
//   }

//   return {
//     channel_order_food_id: data.channelFoodToken.channel_order_food_id,
//     orders: dataChannelOrders.filter((order) => order.details !== "[]"),
//     channel_order_food_token_id: data.channelFoodToken.channel_order_food_token_id,
//   };
// }


// // ------------------ SHF --------------------

// async function getSHFBillHistoryList(
//   url: string,
//   access_token: string,
//   x_foody_entity_id: number,
//   time : string
// ): Promise<any> {
//   try {
//     const headers = {
//       "x-foody-access-token": access_token,
//       "x-foody-entity-id": x_foody_entity_id,
//     };

//     const fromDate = new Date(time);
//     const startOfDay = new Date(
//       fromDate.getFullYear(),
//       fromDate.getMonth(),
//       fromDate.getDate()
//     );
//     const timestampStartOfDay = Math.floor(startOfDay.getTime() / 1000);

//     const now = new Date();
//     const endOfDay = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate()
//     );
//     const timestampEndOfDay = Math.floor(endOfDay.getTime() / 1000);

//     let orders : any[] = [];

//     let  body = {
//       order_filter_type: 40,
//       next_item_id: "",
//       request_count: 10000,
//       from_time: timestampStartOfDay,
//       to_time: timestampEndOfDay + 86399,
//       sort_type: 12,
//     };

//     let i = 1 ; 

//     while (i > 0 ) {

//       const data = await axios.post(url, JSON.stringify(body), { headers });

//       const result = data.data.data.orders.map((o) => ({
//         order_id: o.id ?? "",
//         order_code: o.code ?? "",
//         total_amount: o.total_value_amount ?? 0,
//         discount_amount: o.commission?.amount ?? 0,
//         order_amount: o.order_value_amount ?? 0,
//         customer_order_amount: o.customer_bill?.total_amount ?? 0,
//         customer_discount_amount: o.customer_bill?.total_discount ?? 0,
//         delivery_amount: o.customer_bill?.shipping_fee ?? 0,
//         item_discount_amount: o.customer_bill?.item_discount ?? 0,
//         small_order_amount: o.customer_bill?.small_order_fee ?? 0,
//         bad_weather_amount: o.customer_bill?.bad_weather_fee ?? 0,
//         order_status: o.order_status ?? 0,
//         driver_name: o.assignee?.name ?? "",
//         driver_avatar: o.assignee?.avatar_url ?? "",
//         driver_phone: o.assignee?.phone ?? "",
//         create_at : o.order_time ?? 0,
//         customer_phone: !o.order_user.phone ? "" : o.order_user.phone,
//         customer_name: !o.order_user.name ? "" : o.order_user.name,
//         customer_address: !o.deliver_address.address
//           ? ""
//           : o.deliver_address.address,
//         foods: o.order_items.map((f) => ({
//           food_id: f.dish?.id ?? "",
//           price: f.dish?.original_price ?? 0,
//           food_price_addition: f.original_price ?? 0,
//           food_name: f.dish?.name ?? "",
//           quantity: f.quantity ?? 0,
//           note: f.note ?? "",
//           options: f.options_groups.flatMap((group) =>
//             group.options.map((option) => ({
//               name: option.name ?? "",
//               price: option.original_price ?? 0,
//               quantity: option.quantity ?? 0,
//             }))
//           ),
//         })),
//       }));

//       body.next_item_id = data.data.data.next_item_id;
//       i = +data.data.data.result_count ; 

//       orders = orders.concat(result);

//     }

//     return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
//   } catch (error) {    

//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, []);
//   }
// }

// // ------------------ SHF --------------------

// // ------------------ GRF --------------------

// async function getGRFOrderList(
//   url: string,
//   access_token: string,
//   time : string
// ): Promise<any> {
//   try {
//     const headers = {
//       Authorization: access_token,
//     };

//     const formattedDate = new Date().toISOString().slice(0, 11);

//     const params = new URLSearchParams({
//       startTime: `${time}T00:00:00.000Z`,
//       endTime: `${formattedDate}23:59:59.999999Z`,
//       pageIndex: "0",
//       pageSize: "10000000",
//     });

//     const fullUrl = `${url}?${params.toString()}`;

//     const data = await axios.get(fullUrl, { headers });

//     const orders = data.data.statements.map((o) => ({
//       order_id: o.ID,
//       order_amount: parseFloat(o.priceDisplay.replace(/\./g, "")),
//       status_string: o.deliveryStatus,
//       driver_name: '',
//       driver_avatar: '',
//       display_id: o.displayID,
//       create_at : o.createdAt
//     }));

//     return new ResponseData(HttpStatus.OK, "SUCCESS", orders);
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, []);
//   }
// }

// async function getGRFOrderDetail(
//   url: string,
//   access_token: string,
//   order_id: string
// ): Promise<any> {
//   try {
//     const headers = {
//       Authorization: access_token,
//     };
//     const fullUrl = `${url}/${order_id}`;

//     const data = await axios.get(fullUrl, { headers });

//     const order = data.data.order;

//     return new ResponseData(HttpStatus.OK, "SUCCESS", {
//       order_id: order.orderID,
//       customer_order_amount:
//         order.fare.reducedPriceDisplay == ""
//           ? 0
//           : parseFloat(order.fare.reducedPriceDisplay.replace(/\./g, "")),
//       customer_discount_amount:
//         (order.fare.promotionDisplay == "-" || order.fare.promotionDisplay == ""
//           ? 0
//           : parseFloat(order.fare.promotionDisplay.replace(/\./g, ""))) +
//         (order.fare.totalDiscountAmountDisplay == ""
//           ? 0
//           : parseFloat(
//               order.fare.totalDiscountAmountDisplay.replace(/\./g, "")
//             )),
//       customer_phone: order.eater.mobileNumber,
//       customer_name: order.eater.name,
//       customer_address: order.eater.address.address,
//       driver_phone: order.driver.mobileNumber,
//       driver_name: order.driver.name,
//       driver_avatar: order.driver.avatar,
//       delivery_amount: isNaN(
//         parseFloat(order.fare.deliveryFeeDisplay.replace(/\./g, ""))
//       )
//         ? 0
//         : parseFloat(order.fare.deliveryFeeDisplay.replace(/\./g, "")),
//       small_order_amount: isNaN(
//         parseFloat(order.fare.smallOrderFeeDisplay.replace(/\./g, ""))
//       )
//         ? 0
//         : parseFloat(order.fare.smallOrderFeeDisplay.replace(/\./g, "")),
//       item_infos: order.itemInfo.items.map((o) => ({
//         food_id: o.itemID,
//         food_name: o.name,
//         quantity: o.quantity,
//         food_price_addition: isNaN(parseFloat(o.fare.priceDisplay.replace(/\./g, ""))) ? 0 :parseFloat(o.fare.priceDisplay.replace(/\./g, "")),
//         price: parseFloat(o.fare.originalItemPriceDisplay.replace(/\./g, "")),
//         note: o.comment,
//         options: o.modifierGroups.flatMap((group) =>
//           group.modifiers.map((modifier) => ({
//             name: modifier.modifierName,
//             quantity: modifier.quantity,
//             price:
//               modifier.priceDisplay == ""
//                 ? 0
//                 : parseFloat(modifier.priceDisplay.replace(/\./g, "")),
//           }))
//         ),
//       })),
//     });
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       order_id: "",
//       customer_order_amount: 0,
//       customer_discount_amount: 0,
//       customer_phone: "",
//       customer_name: "",
//       customer_address: "",
//       driver_phone: "",
//       delivery_amount: 0,
//       small_order_amount: 0,
//       item_infos: [],
//     });
//   }
// }

// async function loginGRF(
//   url: string,
//   usernamne: string,
//   password: string,
//   device_id: string,
//   device_brand: string
// ): Promise<any> {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//     };

//     const body = {
//       login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
//       session_data: {
//         mobile_session_data: {
//           device_model: "iPhone 13",
//           device_id: device_id,
//           device_brand: device_brand,
//         },
//       },
//       without_force_logout: true,
//       password: password,
//       username: usernamne,
//     };

//     const data = await axios.post(url, JSON.stringify(body), { headers });

//     if (data.data.data.code === 200) {
//       return new ResponseData(HttpStatus.OK, "SUCCESS", {
//         device_id: !data.data.data.active_session
//           ? device_id
//           : !data.data.data.active_session.mobile_session_data
//           ? device_id
//           : data.data.data.active_session.mobile_session_data.device_id,
//         device_brand: !data.data.data.active_session
//           ? device_brand
//           : !data.data.data.active_session.mobile_session_data
//           ? device_brand
//           : data.data.data.active_session.mobile_session_data.device_brand,
//         jwt: !data.data.data.data ? "" : data.data.data.data.jwt,
//       });
//     } else {
//       return new ResponseData(
//         HttpStatus.BAD_REQUEST,
//         "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
//         {
//           device_id: device_id,
//           device_brand: device_brand,
//           jwt: "",
//         }
//       );
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       device_id: device_id,
//       device_brand: device_brand,
//       jwt: "",
//     });
//   }
// }

// async function logoutGRF(
//   url: string,
//   usernamne: string,
//   password: string
// ): Promise<any> {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//     };

//     const body = {
//       login_source: "TROY_APP_MAIN_USERNAME_PASSWORD",
//       session_data: {
//         mobile_session_data: {
//           device_model: "iPhone 13",
//           device_id: "",
//           device_brand: "",
//         },
//       },
//       without_force_logout: false,
//       password: password,
//       username: usernamne,
//     };

//     const data = await axios.post(url, JSON.stringify(body), { headers });

//     if (data.data.data.code === 200) {
//       return new ResponseData(HttpStatus.OK, "SUCCESS", {
//         device_id: "",
//         device_brand: "",
//         jwt: !data.data.data.data ? "" : data.data.data.data.jwt,
//       });
//     } else {
//       return new ResponseData(
//         HttpStatus.BAD_REQUEST,
//         "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
//         {
//           device_id: "",
//           device_brand: "",
//           jwt: "",
//         }
//       );
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       device_id: "",
//       device_brand: "",
//       jwt: "",
//     });
//   }
// }

// async function updateGRFDeviceInfor(
//   url: string,
//   access_token: string,
//   device_id: string,
//   device_brand: string
// ): Promise<any> {
//   try {
//     const headers = {
//       "x-mts-ssid": access_token,
//     };

//     const body = {
//       deviceInfo: {
//         UType: "foodmax",
//         DevBrand: device_brand,
//         DevUDID: device_id,
//         DevModel: device_brand,
//       },
//     };

//     const data = await axios.post(url, body, { headers });

//     if (data.status == 200) {
//       return new ResponseData(HttpStatus.OK, "SUCCESS", {
//         message: data.data.message,
//       });
//     } else {
//       return new ResponseData(
//         HttpStatus.BAD_REQUEST,
//         "Vui lòng đăng nhập trên thiết bị di động . rồi hãy thử lại",
//         {
//           message: data.data.message,
//         }
//       );
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       message: "",
//     });
//   }
// }

// async function syncTokenGRF(
//   url_login: string,
//   url_update_device: string,
//   usernamne: string,
//   password: string,
//   device_id: string,
//   device_brand: string
// ): Promise<any> {
//   let data = await loginGRF(
//     url_login,
//     usernamne,
//     password,
//     device_id,
//     device_brand
//   );

//   if (
//     data.status == HttpStatus.BAD_REQUEST ||
//     data.status == HttpStatus.TOO_MANY_REQUESTS
//   ) {
//     return "";
//   }

//   if (data.data.jwt == "" || data.data.jwt == null) {
//     await delay(2000);
//     data = await loginGRF(
//       url_login,
//       usernamne,
//       password,
//       data.data.device_id,
//       data.data.device_brand
//     );
//   }

//   if (
//     data.status == HttpStatus.BAD_REQUEST ||
//     data.status == HttpStatus.TOO_MANY_REQUESTS
//   ) {
//     return;
//   }

//   if (data.data.jwt == "" || data.data.jwt == null) {
//     await delay(2000);
//     data = await logoutGRF(url_login, usernamne, password);

//     if (data.status != HttpStatus.OK) {
//       return "";
//     }

//     await updateGRFDeviceInfor(
//       url_update_device,
//       data.data.jwt,
//       device_id,
//       device_brand
//     );
//   }

//   return data.data.jwt;

//   async function delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }
// }
// // ------------------ GRF --------------------
// // ------------------ BEF --------------------

// async function getBEFBillListHistory(
//   url: string,
//   access_token: string,
//   channel_branch_id: string,
//   merchant_id: string,
//   time : string 
// ): Promise<any> {
//   try {
//     const moment = require("moment");

//     const headers = {
//       "Content-Type": "application/json",
//     };

//     const body = {
//       access_token: access_token,
//       restaurant_id: +channel_branch_id,
//       merchant_id: +merchant_id,
//       fetch_type: "previous",
//       start_date: time,
//       end_date: moment(new Date()).format("YYYY-MM-DD"),
//     };

//     const data = await axios.post(url, JSON.stringify(body), { headers });

//     if (data.data.code == 143) {

//       const bills = data.data.restaurant_orders.map((item) => ({
//         order_id: item.order_id,
//         order_amount: item.order_amount,
//         driver_name: item.driver_name,
//         driver_phone: item.driver_phone_no,
//         order_status: item.delivery_status,
//         create_at : item.created_at
//       }));

//       return new ResponseData(HttpStatus.OK, "SUCCESS", bills);
//     } else {
//       return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, []);
//   }
// }

// async function getBEFBillDetail(
//   url: string,
//   access_token: string,
//   channel_branch_id: string,
//   merchant_id: string,
//   order_id: string
// ): Promise<any> {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//     };

//     const body = {
//       access_token: access_token,
//       restaurant_id: +channel_branch_id,
//       merchant_id: +merchant_id,
//       order_id: +order_id,
//     };

//     const data = await axios.post(url, JSON.stringify(body), { headers });

//     if (data.data.code == 143) {
//       const result = {
//         order_id: data.data.order.order_id,
//         discount_amount: data.data.order.jugnoo_commission,
//         total_amount: data.data.order.net_order_amount,
//         customer_order_amount: data.data.order.total_amount,
//         customer_discount_amount: !data.data.order.offers
//           ? 0
//           : [
//               ...data.data.order.offers.delivery_discounts,
//               ...data.data.order.offers.food_discounts,
//             ].reduce((total, discount) => total + discount.partner_discount, 0),
//         customer_name: data.data.order.customer_name,
//         customer_phone: data.data.order.customer_phone_no || "",
//         customer_address: data.data.order.delivery_address,
//         foods: data.data.order.order_items.map((item) => ({
//           food_id: item.item_id,
//           food_name: item.item_name,
//           quantity: item.quantity,
//           food_price_addition: item.amount,
//           price: item.unit_price,
//           note: item.note,
//           options: JSON.parse(item.customize_json).flatMap((customize) =>
//             customize.options.map((option) => ({
//               name: option.name,
//               price: option.price,
//               quantity: option.quantity,
//             }))
//           ),
//         })),
//       };

//       return new ResponseData(HttpStatus.OK, "SUCCESS", result);
//     } else {
//       return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, []);
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       order_id: "",
//       discount_amount: 0,
//       total_amount: 0,
//       customer_order_amount: 0,
//       customer_discount_amount: 0,
//       customer_name: "",
//       customer_phone: "",
//       customer_address: "",
//       foods: [],
//     });
//   }
// }

// async function loginBEF(
//   url: string,
//   usernamne: string,
//   password: string
// ): Promise<any> {
//   try {
//     let body = {};

//     if (!usernamne.includes("@")) {
//       usernamne = usernamne.replace(/^0/, "+84");

//       body = {
//         password: password,
//         phone_no: usernamne,
//       };
//     } else {
//       body = {
//         password: password,
//         email: usernamne,
//       };
//     }

//     const headers = {
//       "Content-Type": "application/json",
//     };

//     const data = await axios.post(url, JSON.stringify(body), { headers });

//     if (data.data.code == 143) {
//       return new ResponseData(HttpStatus.OK, "SUCCESS", {
//         jwt: !data.data.token ? "" : data.data.token,
//       });
//     } else {
//       return new ResponseData(HttpStatus.BAD_REQUEST, data.data.message, {
//         jwt: "",
//       });
//     }
//   } catch (error) {
//     const statusCode = error.response?.status || HttpStatus.BAD_REQUEST;
//     const message = error.response?.statusText || "Lỗi ! getSHFBillHistoryList";

//     return new ResponseData(statusCode, message, {
//       jwt: "",
//     });
//   }
// }

// async function syncTokenBEF(
//   url_login: string,
//   usernamne: string,
//   password: string
// ): Promise<any> {
//   let data = await loginBEF(url_login, usernamne, password);

//   if (data.status != HttpStatus.OK) {
//     return "";
//   }

//   return data.data.jwt;
// }

// // ------------------ BEF --------------------
