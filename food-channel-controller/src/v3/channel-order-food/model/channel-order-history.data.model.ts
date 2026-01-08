import { PrimaryGeneratedColumn } from "typeorm";

export class ChannelOrderHistoryDataModel {

    @PrimaryGeneratedColumn()
    id: number;

    order_id: string;
  
    channel_branch_id: string;
  
    total_amount: number;

    channel_order_food_id: number;

    channel_order_food_name : string ;

    channel_order_food_code : string ;

    order_created_at : string ;

    display_id : string;

    is_completed: number;

  }


 