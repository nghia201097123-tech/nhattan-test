import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionStoreProcedure } from 'src/utils.common/utils.exception.common/utils.store-procedure-exception.common';
import { StoreProcedureResultOutput } from 'src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result-output-common';
import { StoreProcedureOutputResultInterface } from 'src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common';
import { Repository } from 'typeorm';
import { CustomerChannelFoodInformationEntity } from './entity/customer-channel-food-information.entity';
import { CustomerChannelFoodInformationReportDataModel } from './model/customer-channel-food-information-report.data.model';
import { CustomerChannelFoodInformationReportOutputDataModel } from './model/customer-channel-food-information-report.output.data.model';

@Injectable()
export class CustomerChannelFoodInformationService {
  constructor(
    @InjectRepository(CustomerChannelFoodInformationEntity)
    private readonly customerChannelFoodInformationRepository: Repository<CustomerChannelFoodInformationEntity>,
  ) {}

  async spGRpCustomerChannelFoodInformation(
    restaurantId: number,
    restaurantBrandId: number,
    branchIds : string,
    channelOrderFoodId: number,
    fromDateString: string,
    toDateString: string,
    keySearch: string,
    limit: number,
    offSet: number
  ): Promise<
    StoreProcedureOutputResultInterface<CustomerChannelFoodInformationReportDataModel, CustomerChannelFoodInformationReportOutputDataModel>
  > {

    // console.log(
    //   `CALL sp_g_rp_customer_channel_food_information(${[restaurantId, +restaurantBrandId, branchIds , channelOrderFoodId, fromDateString ,toDateString , keySearch , limit , offSet ]})`
    // );
    
    let channelOrderHistoryDataModel: CustomerChannelFoodInformationReportDataModel = await this.customerChannelFoodInformationRepository.query(
      `CALL sp_g_rp_customer_channel_food_information(? , ? , ? , ? , ? , ? , ? , ? , ? , 
      @totalCustomerBuyOnce , @totalCustomerBuyTwo , @totalCustomerBuyThree , @totalCustomerBuyMuch , @totalRecord ,
      @totalOrder , @totalOrderSHF , @totalOrderGRF , @totalOrderBEF , @totalOrderAmount , @totalOrderAmountSHF , @totalOrderAmountGRF , @totalOrderAmountBEF
      ,@status, @message); 
      SELECT @totalCustomerBuyOnce AS total_customer_buy_once, @totalCustomerBuyTwo AS total_customer_buy_two, @totalCustomerBuyThree AS total_customer_buy_three, 
      @totalCustomerBuyMuch AS total_customer_buy_much, @totalRecord AS total_record ,
      @totalOrder AS total_order, @totalOrderSHF AS total_order_SHF, @totalOrderGRF AS total_order_GRF, @totalOrderBEF AS total_order_BEF,
      @totalOrderAmount AS total_order_amount, @totalOrderAmountSHF AS total_order_amount_SHF, @totalOrderAmountGRF AS total_order_amount_GRF, @totalOrderAmountBEF AS total_order_amount_BEF
      , @status AS status_code , @message AS message_error`,
      [restaurantId , restaurantBrandId , branchIds , channelOrderFoodId , fromDateString , toDateString , keySearch , limit , offSet ]
    );

    ExceptionStoreProcedure.validate(channelOrderHistoryDataModel);

    let data: StoreProcedureOutputResultInterface<CustomerChannelFoodInformationReportDataModel, CustomerChannelFoodInformationReportOutputDataModel> =
      new StoreProcedureResultOutput<CustomerChannelFoodInformationReportOutputDataModel>().getResultOutputList(channelOrderHistoryDataModel);

    return data;
  }

}
