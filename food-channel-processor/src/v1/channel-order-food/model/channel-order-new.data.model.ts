import { PrimaryGeneratedColumn } from "typeorm";

export class ChannelOrderNewDataModel {

    @PrimaryGeneratedColumn()
    channel_order_id: number;

    channel_order_food_id:number;

    order_id: string;
  
    display_id: string;

}

 