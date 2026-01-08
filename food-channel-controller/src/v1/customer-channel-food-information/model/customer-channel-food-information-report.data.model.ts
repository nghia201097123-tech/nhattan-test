import {  PrimaryGeneratedColumn } from "typeorm";

export class CustomerChannelFoodInformationReportDataModel {

    @PrimaryGeneratedColumn()
    id: number;

    customer_name: string;
  
    customer_phone: string;
  
    customer_address: string;
  
    total_order: number;

    total_order_SHF : number ;

    total_order_GRF : number ;

    total_order_GOF : number;

    total_order_BEF : number;

    total_order_amount_SHF : number;

    total_order_amount_BEF : number;

    total_order_amount_GRF : number;

    total_order_amount : number;

    total_amount_avg_SHF: number;

    total_amount_avg_GRF: number;

    total_amount_avg_BEF: number;
    
    total_amount_avg: number;

}