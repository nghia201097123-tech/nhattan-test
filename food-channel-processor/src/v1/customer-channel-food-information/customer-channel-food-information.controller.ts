import { Controller } from '@nestjs/common';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import {
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { CustomerChannelFoodInformationService } from "./customer-channel-food-information.service";
import { StoreProcedureOutputResultInterface } from 'src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common';
import { CustomerChannelFoodInformationReportDataModel } from './model/customer-channel-food-information-report.data.model';
import { CustomerChannelFoodInformationReportOutputDataModel } from './model/customer-channel-food-information-report.output.data.model';
import { CustomerChannelFoodInformationReportOutResponse } from './response/customer-channel-food-information-report.output.response';
import { GrpcMethod } from '@nestjs/microservices';

@Controller({
  version: VersionEnum.V1.toString(),
  path: "customer-channel-food-informations"
})
@ApiBearerAuth()
export class CustomerChannelFoodInformationController {
  constructor(private readonly customerChannelFoodInformationService: CustomerChannelFoodInformationService) { }

  @GrpcMethod("ChannelOrderFoodReportService", "getCustomerChannelFoodInformationReport")
  async getCustomerChannelFoodInformationReport(
    customerChannelFoodInformationReportDto: {
        restaurant_id: number,
        restaurant_brand_id: number,
        branch_ids: string,
        channel_order_food_id: number,
        from_date_string: string,
        to_date_string: string,
        key_search: string,
        limit: number,
        offset: number
    }
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let result: StoreProcedureOutputResultInterface<
      CustomerChannelFoodInformationReportDataModel,
      CustomerChannelFoodInformationReportOutputDataModel
    > = await this.customerChannelFoodInformationService.spGRpCustomerChannelFoodInformation(
      customerChannelFoodInformationReportDto.restaurant_id,
      customerChannelFoodInformationReportDto.restaurant_brand_id,
      customerChannelFoodInformationReportDto.branch_ids,
      customerChannelFoodInformationReportDto.channel_order_food_id,
      customerChannelFoodInformationReportDto.from_date_string,
      customerChannelFoodInformationReportDto.to_date_string,
      customerChannelFoodInformationReportDto.key_search,
      customerChannelFoodInformationReportDto.limit,
      customerChannelFoodInformationReportDto.offset
    );

    response.setData(new CustomerChannelFoodInformationReportOutResponse(result.output, result.list, customerChannelFoodInformationReportDto.limit));

    return response;
  }

}

