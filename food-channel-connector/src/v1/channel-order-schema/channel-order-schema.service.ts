import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { ChannelOrderSchema } from "./schema/channel-order.schema";
import { UtilsDate } from "src/utils.common/utils.format-time.common/utils.format-time.common";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

@Injectable()
export class ChannelOrderSchemaService {
  constructor(
    @InjectModel(ChannelOrderSchema.name)
    private readonly channelOrderModel: Model<ChannelOrderSchema>
  ) { }

  async createMany(
    channelOrders: ChannelOrderSchema[]
  ): Promise<any> {
    try {
      await this.channelOrderModel.insertMany(channelOrders);
    } catch (error) {
      console.error("Error updating orders:", error);
    }

  }

  async updateManyOrders(
    filter: FilterQuery<ChannelOrderSchema>,
    updateData: Partial<ChannelOrderSchema>
  ): Promise<any> {
    return await this.channelOrderModel.updateMany(filter, {
      $set: updateData,
    });
  }

  async updateOrderNews(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderNewsV2(
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            is_grpc_complete : 0
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrdersV2(
    // restaurantId: number,
    // restaurantBrandId: number,
    // branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            is_grpc_complete : 0
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrdersGrabV2(
    // restaurantId: number,
    // restaurantBrandId: number,
    // branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            display_id : orderUpdate.display_id,
            is_grpc_complete : 0
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderNewsForGrabFood(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
          },
          update: {
            $set: {
              status_string: orderUpdate.status_string,
              is_need_update: 1
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderNewsForGrabFoodV2(
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            display_id : orderUpdate.display_id
          },
          update: {
            $set: {
              status_string: orderUpdate.status_string,
              is_need_update: 1
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderHistoryForGrabFood(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            is_grpc_complete : 0
          },
          update: {
            $set: {
              status_string: orderUpdate.status_string,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderHistoryForGrabFoodV2(
    // restaurantId: number,
    // restaurantBrandId: number,
    // branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {      
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            display_id: orderUpdate.display_id,
            is_grpc_complete : 0
          },
          update: {
            $set: {
              status_string: orderUpdate.status_string,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderHistories(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            is_grpc_complete: 0,
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateOrderHistoriesV2(
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            branch_id: orderUpdate.branch_id,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
            is_grpc_complete: 0,
          },
          update: {
            $set: {
              driver_name: orderUpdate.driver_name,
              driver_phone: orderUpdate.driver_phone,
              status_string: orderUpdate.status_string,
              order_status: orderUpdate.order_status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  convertToChannelOrderSchemas(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    data: any[],
    channelOrderFoodId: number
  ): ChannelOrderSchema[] {
    return data.map((item) => {
      let channelOrder = new ChannelOrderSchema();
      channelOrder.restaurant_id = restaurantId;
      channelOrder.restaurant_brand_id = restaurantBrandId;
      channelOrder.branch_id = branchId;
      channelOrder.order_id = item.order_id;
      channelOrder.order_code = item.order_code || "";
      channelOrder.channel_order_food_id = channelOrderFoodId;
      channelOrder.channel_branch_id = item.channel_branch_id;
      channelOrder.channel_order_food_token_id =
        item.channel_order_food_token_id;
      channelOrder.delivery_amount = item.delivery_amount || 0;
      channelOrder.discount_amount = item.discount_amount || 0;
      channelOrder.customer_discount_amount =
        item.customer_discount_amount || 0;
      channelOrder.customer_order_amount = item.customer_order_amount || 0;
      channelOrder.order_amount = item.order_amount || 0;
      channelOrder.total_amount = item.total_amount || 0;
      channelOrder.driver_name = item.driver_name || "";
      channelOrder.driver_phone = item.driver_phone || "";
      channelOrder.display_id = item.display_id || "";
      channelOrder.status_string = item.status_string || "";
      channelOrder.payment_type = item.payment_type || 0;
      channelOrder.order_status = item.order_status || 0;
      channelOrder.is_grpc_complete = item.is_grpc_complete || 0;
      channelOrder.customer_name = item.customer_name || "";
      channelOrder.customer_phone = item.customer_phone || "";
      channelOrder.delivery_address = item.delivery_address || "";
      channelOrder.item_discount_amount = item.item_discount_amount || 0;
      channelOrder.small_order_amount = item.small_order_amount || 0;
      channelOrder.bad_weather_amount = item.bad_weather_amount || 0;
      channelOrder.note = item.note || "";
      channelOrder.details = item.details || "[]";
      channelOrder.is_need_update = item.is_need_update || 1;
      channelOrder.is_new = item.is_new || 1;
      channelOrder.day = UtilsDate.formatDateToMysqlString(new Date());
      channelOrder.deliver_time = item.deliver_time || "";
      channelOrder.is_scheduled_order = item.is_scheduled_order || 0;
      channelOrder.channel_order_id = item.channel_order_id || 0;
      channelOrder.completed_at = null;
      return channelOrder;
    });
  }

  convertToChannelOrderSchemasV2(
    data: any[],
    channelOrderFoodId: number
  ): ChannelOrderSchema[] {
    return data.map((item) => {
      let channelOrder = new ChannelOrderSchema();
      channelOrder.branch_id = item.branch_id;
      channelOrder.order_id = item.order_id;
      channelOrder.order_code = item.order_code || "";
      channelOrder.channel_order_food_id = channelOrderFoodId;
      channelOrder.channel_branch_id = item.channel_branch_id;
      channelOrder.channel_order_food_token_id =
        item.channel_order_food_token_id;
      channelOrder.delivery_amount = item.delivery_amount || 0;
      channelOrder.discount_amount = item.discount_amount || 0;
      channelOrder.customer_discount_amount =
        item.customer_discount_amount || 0;
      channelOrder.customer_order_amount = item.customer_order_amount || 0;
      channelOrder.order_amount = item.order_amount || 0;
      channelOrder.total_amount = item.total_amount || 0;
      channelOrder.driver_name = item.driver_name || "";
      channelOrder.driver_phone = item.driver_phone || "";
      channelOrder.display_id = item.display_id || "";
      channelOrder.status_string = item.status_string || "";
      channelOrder.payment_type = item.payment_type || 0;
      channelOrder.order_status = item.order_status || 0;
      channelOrder.is_grpc_complete = item.is_grpc_complete || 0;
      channelOrder.customer_name = item.customer_name || "";
      channelOrder.customer_phone = item.customer_phone || "";
      channelOrder.delivery_address = item.delivery_address || "";
      channelOrder.item_discount_amount = item.item_discount_amount || 0;
      channelOrder.small_order_amount = item.small_order_amount || 0;
      channelOrder.bad_weather_amount = item.bad_weather_amount || 0;
      channelOrder.note = item.note || "";
      channelOrder.details = item.details || "[]";
      channelOrder.is_need_update = item.is_need_update || 1;
      channelOrder.is_new = item.is_new || 1;
      channelOrder.day = UtilsDate.formatDateToMysqlString(new Date());
      channelOrder.deliver_time = item.deliver_time || "";
      channelOrder.is_scheduled_order = item.is_scheduled_order || 0;
      channelOrder.channel_order_id = item.channel_order_id || 0;
      channelOrder.completed_at = null;
      return channelOrder;
    });
  }

  async getOrders(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number
  ): Promise<any[]> {
    // Lấy ngày hiện tại và ngày hôm qua
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = UtilsDate.formatDateToMysqlString(today);
    const yesterdayStr = UtilsDate.formatDateToMysqlString(yesterday);

    // Thực hiện truy vấn
    return this.channelOrderModel
      .find(
        {
          restaurant_id,
          restaurant_brand_id,
          branch_id,
          channel_order_food_id,
          day: {
            $gte: yesterdayStr, // Ngày hôm qua
            $lte: todayStr, // Ngày hôm nay
          },
        },
        {
          order_id: 1, // Lấy field1
          driver_name: 1, // Lấy field2
          is_grpc_complete: 1,
          day:1, 
          _id: 0, // Loại trừ _id
        }
      )
      .exec();
  }


  async updateGrfOrderFail(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {

      const operations = orderUpdates.map((orderId) => ({
        updateMany: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderId,
            is_grpc_complete: 0
          },
          update: {
            $set: {
              status_string: 'CANCELLED_MAX',
              order_status: 0,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async refreshStatusChannelOrders(
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {

      const operations = orderUpdates.map((order) => ({
        updateMany: {
          filter: {
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: order.channel_order_id,
            is_grpc_complete: 0

          },
          update: {
            $set: {
              status_string: order.status_string,
              order_status: order.status,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async refreshStatusChannelOrdersGrab(
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {

      const operations = orderUpdates.map((order) => ({
        updateMany: {
          filter: {
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: order.channel_order_id,
            display_id: order.display_id,
            is_grpc_complete: 0
          },
          update: {
            $set: {
              status_string: order.status_string,
              is_need_update: 1,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async getOrderNewsToCheck(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number,
    order_ids?: string[]  // Thêm tham số order_ids optional
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      restaurant_id,
      restaurant_brand_id,
      branch_id,
      channel_order_food_id,
    };

    // Thêm điều kiện order_ids nếu có
    if (order_ids && order_ids.length > 0) {
      conditions.order_id = { $in: order_ids };
    }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          driver_name: 1,
          _id: 0,
        }
      )
      .exec();
  }

  async getOrderNewsToCheckV2(
    branch_ids: number[],
    channel_order_food_id: number,
    order_ids?: string[]  // Thêm tham số order_ids optional
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      channel_order_food_id,
      branch_id : { $in: branch_ids },
    };

    // Thêm điều kiện order_ids nếu có
    if (order_ids && order_ids.length > 0) {
      conditions.order_id = { $in: order_ids };
    }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          driver_name: 1,
          branch_id:1,
          display_id:1,
          is_grpc_complete:1,
          order_status:1,
          status_string:1,
          _id: 0,
        }
      )
      .exec();
  }

  async getOrderNewsToCheckV3(
    branchId: number,
    channelOrderFoodId: number,
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      channel_order_food_id : channelOrderFoodId,
      branch_id : branchId,
    };

    // Thêm điều kiện order_ids nếu có
    // if (orderIds && orderIds.length > 0) {
    //   conditions.order_id = { $in: orderIds };
    // }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          driver_name: 1,
          // branch_id:1,
          display_id:1,
          // is_grpc_complete:1,
          order_status:1,
          status_string:1,
          _id: 0,
        }
      )
      .sort({ _id: -1 })
      .limit(100) 
      .exec()
  }

  async getOrderHistoriesToCheck(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number,
    order_ids?: string[]  // Thêm tham số order_ids optional
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      restaurant_id,
      restaurant_brand_id,
      branch_id,
      channel_order_food_id,
      is_grpc_complete : 0
    };

    // Thêm điều kiện order_ids nếu có
    if (order_ids && order_ids.length > 0) {
      conditions.order_id = { $in: order_ids };
    }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          driver_name: 1,
          _id: 0,
        }
      )
      .exec();
  }

  async getOrderHistoriesToCheckV2(
    // restaurant_id: number,
    // restaurant_brand_id: number,
    branchIds: number[],
    channel_order_food_id: number,
    order_ids?: string[]  // Thêm tham số order_ids optional
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      // restaurant_id,
      // restaurant_brand_id,
      branch_id : { $in: branchIds },
      channel_order_food_id,
      is_grpc_complete : 0
    };

    // Thêm điều kiện order_ids nếu có
    if (order_ids && order_ids.length > 0) {
      conditions.order_id = { $in: order_ids };
    }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          driver_name: 1,
          branch_id:1,
          display_id:1,
          _id: 0,
        }
      )
      .exec();
  }

  async getOrdersCanToFailOfGrabfood(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      restaurant_id,
      restaurant_brand_id,
      branch_id,
      channel_order_food_id : +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
      status_string : 'ORDER_IN_PREPARE'
    }
    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          channel_branch_id:1,
          status_string:1,
          driver_name:1,
          driver_phone:1,
          _id: 0,
        }
      )
      .sort({ _id: -1 })
      .limit(100) 
      .exec()
      // .then(results => results.map(doc => doc.order_id))
      ; 
  }

  async getOrdersCanToFailOfGrabfoodV2(
    // restaurant_id: number,
    // restaurant_brand_id: number,
    branchIds: number[],
  ): Promise<any[]> {
    // Tạo query conditions
    const conditions: any = {
      // restaurant_id,
      // restaurant_brand_id,
      branch_id : { $in: branchIds },
      channel_order_food_id : +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
      status_string : 'ORDER_IN_PREPARE'
    }
    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          channel_branch_id:1,
          status_string:1,
          driver_name:1,
          driver_phone:1,
          branch_id:1,
          _id: 0,
        }
      )
      .sort({ _id: -1 })
      .limit(100) 
      .exec()
      // .then(results => results.map(doc => doc.order_id))
      ; 
  }

  async getOrderRefreshToCheck(
    branchId: number,
    channelOrderFoodId: number,
    orderIds?: string[]  // Thêm tham số order_ids optional
  ): Promise<any[]> {
    // Tạo query conditions    
    const conditions: any = {
      branch_id : branchId,
      channel_order_food_id : channelOrderFoodId
    };

    // Thêm điều kiện order_ids nếu có
    if (orderIds && orderIds.length > 0) {
      conditions.order_id = { $in: orderIds };
    }

    // Thực hiện truy vấn với conditions
    return this.channelOrderModel
      .find(
        conditions,
        {
          order_id: 1,
          display_id:1,
          _id: 0,
        }
      )
      .exec();
  }

  convertToChannelOrderRefreshSchemas(
    branchId: number,
    channelOrderFoodId: number,
    data: any[],

  ): ChannelOrderSchema[] {
    return data.map((item) => {
      let channelOrder = new ChannelOrderSchema();
      channelOrder.branch_id = +branchId;
      channelOrder.order_id = item.channel_order_id;
      channelOrder.channel_order_food_id = channelOrderFoodId;
      channelOrder.status_string = item.status_string || "";
      channelOrder.order_status = item.status || 0;
      channelOrder.is_grpc_complete = 0;
      channelOrder.is_need_update = 1;
      channelOrder.is_new = 0;
      channelOrder.display_id=item.display_id || "";
      channelOrder.completed_at = null;
      return channelOrder;
    });
  }

}
