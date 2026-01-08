import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChannelBranchSchema } from "./schema/channel-branch.schema";

@Injectable()
export class ChannelBranchSchemaService {
    constructor(
        @InjectModel(ChannelBranchSchema.name)
        private readonly channelBranchModel: Model<ChannelBranchSchema>
    ) { }

    async createMany(
        channelBranches: ChannelBranchSchema[]
    ): Promise<ChannelBranchSchema[]> {
        return await this.channelBranchModel.insertMany(channelBranches);
    }

    async convertToChannelBranchSchemas(
        restaurantId: number,
        restaurantBrandId: number,
        channelOrderFoodId: number,
        data: any[]): Promise<ChannelBranchSchema[]> {

        return data.map((item) => {
            let channelBranch = new ChannelBranchSchema();
            channelBranch.restaurant_id = restaurantId;
            channelBranch.restaurant_brand_id = restaurantBrandId;
            channelBranch.channel_order_food_id = channelOrderFoodId;
            channelBranch.channel_order_food_token_id = item.channel_order_food_token_id;
            channelBranch.channel_order_food_token_name = item.channel_order_food_token_name;
            channelBranch.channel_branch_id = item.branch_id;
            channelBranch.channel_branch_name = item.branch_name;
            channelBranch.channel_branch_address = item.branch_address;
            channelBranch.channel_branch_phone = item.branch_phone;
            return channelBranch;
        });
    }

    async getBranches(
        restaurantId: number,
        restaurantBrandId: number,
        channelOrderFoodId?: number
    ): Promise<any[]> {
        const query: any = {
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
        };

        if (channelOrderFoodId && channelOrderFoodId > 0) {
            query.channel_order_food_id = channelOrderFoodId;
        }

        return await this.channelBranchModel.find(
            query ,
            {
                channel_branch_id: 1,
                channel_branch_name: 1,
                channel_branch_address: 1,
                channel_branch_phone: 1,
                channel_order_food_token_id: 1,
                channel_order_food_token_name: 1,
            }
        ).exec();
    }

    async deleteBranches(
        restaurantId: number,
        restaurantBrandId: number,
        channelOrderFoodId: number
    ): Promise<any> {

        await this.channelBranchModel.deleteMany({
            restaurant_id: restaurantId,
            restaurant_brand_id: restaurantBrandId,
            channel_order_food_id: channelOrderFoodId
        });
    }
}