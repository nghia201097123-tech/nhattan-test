import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { ChannelOrderSchema } from "./schema/channel-order.schema";
import { UtilsDate } from "src/utils.common/utils.format-time.common/utils.format-time.common";
import { ChannelOrderNewSchemaModel } from "./schema-model/channel-order-new.schema.model";
import { ChannelOrderHistorySchemaModel } from "./schema-model/channel-order-history.schema.model";
import { ChannelOrderNewDataModel } from "../channel-order-food/model/channel-order-new.data.model";

@Injectable()
export class ChannelOrderSchemaService {
  constructor(
    @InjectModel(ChannelOrderSchema.name)
    private readonly channelOrderModel: Model<ChannelOrderSchema>
  ) {}

  async createMany(
    channelOrders: ChannelOrderSchema[]
  ): Promise<ChannelOrderSchema[]> {
    return await this.channelOrderModel.insertMany(channelOrders);
  }

  async updateManyOrders(
    filter: FilterQuery<ChannelOrderSchema>,
    updateData: Partial<ChannelOrderSchema>
  ): Promise<any> {
    return await this.channelOrderModel.updateMany(filter, {
      $set: updateData,
    });
  }

  async updateNewOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateOne: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
          },
          update: {
            $set: {
              is_new: 0,
              is_need_update: 0,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateNewOrdersV2(
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[]
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: +branchId,
            channel_order_food_id: +channelOrderFoodId,
            order_id:`${orderUpdate.order_id}`,
          },
          update: {
            $set: {
              is_new: 0,
              is_need_update: 0,
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateNewOrdersV3(
    branchId: number,
    orderUpdates: ChannelOrderNewDataModel[]
  ) {
    try {

      if(orderUpdates.length > 0){
        const operations = orderUpdates.map((orderUpdate) => ({
          updateMany: {
            filter: {
              branch_id: +branchId,
              channel_order_food_id: +orderUpdate.channel_order_food_id,
              order_id:`${orderUpdate.order_id}`,
              display_id:`${orderUpdate.display_id}`,
            },
            update: {
              $set: {
                is_new: 0,
                is_need_update: 0,
                channel_order_id : orderUpdate.channel_order_id 
              },
            },
          },
        }));

        await this.channelOrderModel.bulkWrite(operations);
    }
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }


  async updateHistoryOrders(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[],
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateOne: {
          filter: {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            branch_id: branchId,
            channel_order_food_id: channelOrderFoodId,
            order_id: orderUpdate.order_id,
          },
          update: {
            $set: {
              is_new: 0,
              is_need_update: 0
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateHistoryOrdersV2(
    // restaurantId: number,
    // restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    orderUpdates: any[],
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            // restaurant_id: restaurantId,
            // restaurant_brand_id: restaurantBrandId,
            branch_id: +branchId,
            channel_order_food_id: +channelOrderFoodId,
            order_id: `${orderUpdate.order_id}`,
          },
          update: {
            $set: {
              is_new: 0,
              is_need_update: 0
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateHistoryOrdersV3(
    branchId: number,
    orderUpdates: any[],
  ) {
    try {
      const operations = orderUpdates.map((orderUpdate) => ({
        updateMany: {
          filter: {
            branch_id: +branchId,
            order_id: `${orderUpdate.order_id}`,
            channel_order_id: +orderUpdate.channel_order_id,
          },
          update: {
            $set: {
              is_new: 0,
              is_need_update: 0
            },
          },
        },
      }));

      await this.channelOrderModel.bulkWrite(operations);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateCompleteOrders(
    branchId: number,
    orderIdsComplete: any[]
  ) {
    try {

        const operations = orderIdsComplete.map((orderUpdate) => ({
          updateMany: {
            filter: {
              branch_id: +branchId,
              is_grpc_complete: 0,
              channel_order_food_id: +orderUpdate.channel_order_food_id,
              order_id: `${orderUpdate.order_id}`,
              display_id: `${orderUpdate.display_id}`,
            },
            update: {
              $set: {
                is_new: 0,
                is_need_update: 0,
                is_grpc_complete: 1,
                completed_at : new Date()
              },
            },
          },
        }));

        await this.channelOrderModel.bulkWrite(operations);    

    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateCompleteOrdersV2(
    branchId: number,
    orderIdsComplete: any[]
  ) {
    try {

        const operations = orderIdsComplete.map((orderUpdate) => ({
          updateMany: {
            filter: {
              branch_id: +branchId,
              is_grpc_complete: 0,
              channel_order_id : +orderUpdate?.channel_order_id || 0
            },
            update: {
              $set: {
                is_new: 0,
                is_need_update: 0,
                is_grpc_complete: 1,
                completed_at : new Date()
              },
            },
          },
        }));

        await this.channelOrderModel.bulkWrite(operations);    

    } catch (error) {
      console.error("Error updating orders:", error);
    }
  }

  async updateCompleteOrdersByChannelOrderId(
    channelOrderId: number,
  ) {
    try {
     
      await this.channelOrderModel.updateMany(
        {
          is_grpc_complete: 0,
          channel_order_id: channelOrderId,
        },
        {
          $set: {
            is_new: 0,
            is_need_update: 0,
            is_grpc_complete: 1,
            completed_at: new Date(),
          },
        }
      );
  
    } catch (error) {
      console.error('Error updating orders:', error);
      throw error;
    }
  }
  

  convertToChannelOrderSchemas(data: any[]): ChannelOrderSchema[] {
    return data.map((item) => {
      let channelOrder = new ChannelOrderSchema();
      channelOrder.restaurant_id = item.restaurant_id;
      channelOrder.restaurant_brand_id = item.restaurant_brand_id;
      channelOrder.branch_id = item.branch_id;
      channelOrder.order_id = item.order_id;
      channelOrder.order_code = item.order_code || "";
      channelOrder.channel_order_food_id = item.channel_order_food_id;
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
      channelOrder.is_need_update = item.is_need_update || 1;
      channelOrder.day = UtilsDate.formatDateToMysqlString(new Date());
      return channelOrder;
    });
  }

  async getNewOrders(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number
  ): Promise<ChannelOrderNewSchemaModel[]> {
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
          is_new: 1,
          is_need_update: 1,
          day: {
            $gte: yesterdayStr, // Ngày hôm qua
            $lte: todayStr, // Ngày hôm nay
          },
        },
        {
          order_id: 1,
          order_code: 1,
          channel_branch_id: 1,
          channel_order_food_token_id: 1,
          delivery_amount: 1,
          discount_amount: 1,
          customer_discount_amount: 1,
          customer_order_amount: 1,
          order_amount: 1,
          total_amount: 1,
          driver_name: 1,
          driver_avatar: 1,
          driver_phone: 1,
          display_id: 1,
          status_string: 1,
          order_status: 1,
          customer_name: 1,
          customer_phone: 1,
          delivery_address: 1,
          item_discount_amount: 1,
          small_order_amount: 1,
          bad_weather_amount: 1,
          note: 1,
          details: 1,
          deliver_time: 1,
          is_scheduled_order: 1,
          _id: 0,
        }
      )
      .sort({ _id: -1})
      .limit(100) 
      .exec();
  }

  async getNewOrdersV2(
    // restaurant_id: number,
    // restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number
  ): Promise<ChannelOrderNewSchemaModel[]> {
    // Lấy ngày hiện tại và ngày hôm qua
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = UtilsDate.formatDateToMysqlString(today);
    const yesterdayStr = UtilsDate.formatDateToMysqlString(yesterday);

    // Thực hiện truy vấn
    return await this.channelOrderModel
      .find(
        {
          // restaurant_id,
          // restaurant_brand_id,
          branch_id,
          channel_order_food_id,
          is_new: 1,
          is_need_update: 1,
          day: {
            $gte: yesterdayStr, // Ngày hôm qua
            $lte: todayStr, // Ngày hôm nay
          },
        },
        {
          order_id: 1,
          order_code: 1,
          channel_branch_id: 1,
          channel_order_food_token_id: 1,
          delivery_amount: 1,
          discount_amount: 1,
          customer_discount_amount: 1,
          customer_order_amount: 1,
          order_amount: 1,
          total_amount: 1,
          driver_name: 1,
          driver_avatar: 1,
          driver_phone: 1,
          display_id: 1,
          status_string: 1,
          order_status: 1,
          customer_name: 1,
          customer_phone: 1,
          delivery_address: 1,
          item_discount_amount: 1,
          small_order_amount: 1,
          bad_weather_amount: 1,
          note: 1,
          details: 1,
          deliver_time: 1,
          is_scheduled_order: 1,
          _id: 0,
        }
      )
      .sort({ _id: -1})
      .limit(100) 
      .exec();
  }

  async getNewOrdersV3(
    branch_id: number,
  ): Promise<ChannelOrderNewSchemaModel[]> {
    // Lấy ngày hiện tại và ngày hôm qua
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = UtilsDate.formatDateToMysqlString(today);
    const yesterdayStr = UtilsDate.formatDateToMysqlString(yesterday);

    // Thực hiện truy vấn
    return await this.channelOrderModel
      .find(
        {
          // restaurant_id,
          // restaurant_brand_id,
          branch_id,
          is_new: 1,
          is_need_update: 1,
          day: {
            $gte: yesterdayStr, // Ngày hôm qua
            $lte: todayStr, // Ngày hôm nay
          },
        },
        {
          order_id: 1,
          order_code: 1,
          channel_branch_id: 1,
          channel_order_food_token_id: 1,
          channel_order_food_id:1,
          delivery_amount: 1,
          discount_amount: 1,
          customer_discount_amount: 1,
          customer_order_amount: 1,
          order_amount: 1,
          total_amount: 1,
          driver_name: 1,
          driver_avatar: 1,
          driver_phone: 1,
          display_id: 1,
          status_string: 1,
          order_status: 1,
          customer_name: 1,
          customer_phone: 1,
          delivery_address: 1,
          item_discount_amount: 1,
          small_order_amount: 1,
          bad_weather_amount: 1,
          note: 1,
          details: 1,
          deliver_time: 1,
          is_scheduled_order: 1,
          _id: 0,
        }
      )
      .sort({ _id: -1})
      .limit(100) 
      .exec();
  }

  async getHistoryOrders(
    restaurant_id: number,
    restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number
  ): Promise<ChannelOrderHistorySchemaModel[]> {
    // Lấy ngày hiện tại và ngày hôm qua
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // Thực hiện truy vấn
    return this.channelOrderModel
      .find(
        {
          restaurant_id,
          restaurant_brand_id,
          branch_id,
          channel_order_food_id,
          is_new: 0,
          is_grpc_complete: 0,
          is_need_update: 1,
        },
        {
          order_id: 1,
          driver_name: 1,
          driver_phone: 1,
          status_string: 1,
          order_status: 1,
          _id: 0,
        }
      )
      .limit(50) 
      .exec();
  }

  async getHistoryOrdersV2(
    // restaurant_id: number,
    // restaurant_brand_id: number,
    branch_id: number,
    channel_order_food_id: number
  ): Promise<ChannelOrderHistorySchemaModel[]> {
    // Thực hiện truy vấn
    return await this.channelOrderModel
      .find(
        {
          // restaurant_id,
          // restaurant_brand_id,
          branch_id,
          channel_order_food_id,
          is_new: 0,
          is_grpc_complete: 0,
          is_need_update: 1,
        },
        {
          order_id: 1,
          driver_name: 1,
          driver_phone: 1,
          status_string: 1,
          order_status: 1,
          display_id : 1,
          _id: 0,
        }
      )
      .sort({ _id: -1})
      .limit(50) 
      .exec();
  }

  async getHistoryOrdersV3(
    // restaurant_id: number,
    // restaurant_brand_id: number,
    branch_id: number,
  ): Promise<ChannelOrderHistorySchemaModel[]> {
    // Thực hiện truy vấn
    return await this.channelOrderModel
      .find(
        {
          branch_id,
          is_new: 0,
          is_grpc_complete: 0,
          is_need_update: 1,
        },
        {
          order_id: 1,
          order_code: 1,
          channel_order_food_id: 1,
          channel_order_id: 1,
          driver_name: 1,
          driver_phone: 1,
          status_string: 1,
          order_status: 1,
          display_id : 1,
          _id: 0,
        }
      )
      .sort({ _id: -1})
      .limit(100) 
      .exec();
  }

  async deleteOldGrpcCompletedOrders(): Promise<any> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await this.channelOrderModel.deleteMany({
      is_grpc_complete: { $gt: 0 }, 
      day: { $lt: twoDaysAgo }, 
    }).exec();

  }
}
