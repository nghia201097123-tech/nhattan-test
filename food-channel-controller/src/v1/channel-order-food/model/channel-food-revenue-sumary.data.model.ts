import { PrimaryGeneratedColumn } from "typeorm";

export class ChannelFoodRevenueSumaryDataModel {

    @PrimaryGeneratedColumn()
    report_date: string;

    total_order_SHF: number;
    
    total_order_GRF: number;

    total_order_GOF: number;

    total_order_BEF: number;

    commission_amount_SHF: number;

    commission_amount_GRF: number;

    commission_amount_GOF: number;

    commission_amount_BEF: number;

    order_amount_SHF: number;

    order_amount_GRF: number;

    order_amount_GOF: number;

    order_amount_BEF: number;

    total_amount_SHF: number;

    total_amount_GRF: number;

    total_amount_GOF: number;

    total_amount_BEF : number;

}

