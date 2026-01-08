import { PrimaryGeneratedColumn } from "typeorm";

export class ChannelOrderFoodDataModel {

    @PrimaryGeneratedColumn()
    id: number;

    name: string;
  
    code: string;
  
    image_url: string;
  
    status: number;

    restaurant_brand_channel_order_food_map_id : number ;

    is_connect : number ;

    channel_order_food_token_id : number;

  }