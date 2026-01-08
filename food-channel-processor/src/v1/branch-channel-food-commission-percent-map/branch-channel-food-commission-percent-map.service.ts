import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BranchChannelFoodCommissionPercentMapEntity } from "./entity/branch-channel-food-commission-percent-map.entity";
import { Repository } from "typeorm";
import { ExceptionStoreProcedure } from "src/utils.common/utils.exception.common/utils.store-procedure-exception.common";
import { StoreProcedureResult } from "src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common";
import { CommissionPercentSettingDataModel } from "./model/commission-percent-setting.model.data";
import { CommissionPercentSettingV2DataModel } from "./model/commission-percent-setting-v2.model.data";

@Injectable()
export class BranchChannelFoodCommissionPercentMapService {
  constructor(
    @InjectRepository(BranchChannelFoodCommissionPercentMapEntity)
    private readonly branchChannelFoodCommissionPercentMapEntityRepository: Repository<BranchChannelFoodCommissionPercentMapEntity>,
  ) {}

  async create(dto: BranchChannelFoodCommissionPercentMapEntity): Promise<BranchChannelFoodCommissionPercentMapEntity> {
    // const entity = this.branchChannelFoodCommissionPercentMapEntityRepository.create(dto);
    return this.branchChannelFoodCommissionPercentMapEntityRepository.save(dto);
  }

  async findOne(id: number): Promise<BranchChannelFoodCommissionPercentMapEntity> {
    return this.branchChannelFoodCommissionPercentMapEntityRepository.findOneBy({ id });
  }

  async update(id: number, dto: BranchChannelFoodCommissionPercentMapEntity): Promise<BranchChannelFoodCommissionPercentMapEntity> {
    await this.branchChannelFoodCommissionPercentMapEntityRepository.update(id, dto);
    return this.branchChannelFoodCommissionPercentMapEntityRepository.findOneBy({ id });
  }

  async checkExist(restaurant_id : number ,restaurant_brand_id : number,branch_id : number , channel_order_food_id : number , channel_order_food_token_id : number ) : Promise<BranchChannelFoodCommissionPercentMapEntity>{
    return await this.branchChannelFoodCommissionPercentMapEntityRepository.findOne({
      where : {
        restaurant_id,
        restaurant_brand_id,
        branch_id,
        channel_order_food_id,
        channel_order_food_token_id
      },

    })
  }
  
  async spGListCommissionPercentSettingV2(
    restaurantId: number,
    restaurantBrandId: number,
    branchId: number,
    channelOrderFoodId: number,
    channelOrderFoodTokenId: number
  ): Promise<CommissionPercentSettingV2DataModel[]> {

    const result = await this.branchChannelFoodCommissionPercentMapEntityRepository.query(`
      CALL sp_g_list_commission_percent_setting_v2(?,?,?,?,?, @status_code, @message_error);
      SELECT  @status_code as status_code, @message_error as message_error;
    `, [restaurantId ,restaurantBrandId , branchId,channelOrderFoodId,channelOrderFoodTokenId ]);

    ExceptionStoreProcedure.validate(result);    

    return new StoreProcedureResult<CommissionPercentSettingV2DataModel>().getResultList(result);

  }
}
