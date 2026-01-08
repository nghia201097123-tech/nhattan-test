import { Controller, Get, HttpStatus, Query, Res, } from '@nestjs/common';
import { VersionEnum } from 'src/utils.common/utils.enum/utils.version.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { Response } from 'express';
import { CustomerChannelFoodInformationService } from "./customer-channel-food-information.service";
import { CustomerChannelFoodInformationReportDto } from './dto/customer-channel-food-information-report.dto';
import { StoreProcedureGetReportTimeDatabase } from 'src/utils.common/utils.format-time.common/utils.format-store-procdure.get.time.database';
import { Pagination } from 'src/utils.common/utils.pagination.pagination/utils.pagination';
import { CustomerChannelFoodInformationReportOutResponse } from './response/customer-channel-food-information-report.output.response';
import { GetUser } from 'src/utils.common/utils.decorator.common/utils.decorator.common';
import { UserValidateToken } from 'src/utils.common/utils.middleware.common/user-validate-token';

@Controller({
  version: VersionEnum.V1.toString(),
  path: "customer-channel-food-informations"
})
@ApiBearerAuth()
export class CustomerChannelFoodInformationController {
  constructor(private readonly customerChannelFoodInformationService: CustomerChannelFoodInformationService) { }

  @Get("/list")
  @ApiOperation({ summary: "Báo cáo khách hàng food channel" })
  @ApiResponse({ status: 200, description: 'Successful' })
  async spGRpCustomerChannelFoodInformation(
    @Query() customerChannelFoodInformationReportDto: CustomerChannelFoodInformationReportDto,
    @GetUser() user : UserValidateToken ,
    @Res() res: Response
  ): Promise<any> {
    let response: ResponseData = new ResponseData();

    let time = new StoreProcedureGetReportTimeDatabase(
      customerChannelFoodInformationReportDto.report_type,
      customerChannelFoodInformationReportDto.date_string,
      customerChannelFoodInformationReportDto.from_date,
      customerChannelFoodInformationReportDto.to_date
    ).getReportTimeDatabase();

    let pagination = new Pagination(customerChannelFoodInformationReportDto.page, customerChannelFoodInformationReportDto.limit);

    let dataGrpc = await this.customerChannelFoodInformationService.getCustomerChannelFoodInformationReportGrpc(
      user.restaurant_id,
      customerChannelFoodInformationReportDto.restaurant_brand_id,
      "[" + customerChannelFoodInformationReportDto.branch_ids + "]",
      customerChannelFoodInformationReportDto.food_channel_id,
      time.from_date,
      time.to_date,
      customerChannelFoodInformationReportDto.key_search,
      pagination.getLimit(),
      pagination.getOffset()
    );

    if(dataGrpc.status != HttpStatus.OK){
        response.setStatus(dataGrpc.status);
        response.setMessageError(dataGrpc.message);
        return res.status(HttpStatus.OK).send(response);
      }

    response.setData(new CustomerChannelFoodInformationReportOutResponse(dataGrpc.data));

    return res.status(HttpStatus.OK).send(response);
  }


}

