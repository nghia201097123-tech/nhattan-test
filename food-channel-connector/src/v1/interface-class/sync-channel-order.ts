import { ResponseListData } from "src/utils.common/utils.response.common/utils.list.response.common";

export interface SyncChannelOrderInterface {
  getOrders(
    url: string,
    access_token: string,
    channel_branch_id?: string,
    merchant_id?: string,
    x_sap_ri?: string,
    branch_id ?: number,
  ): Promise<ResponseListData>;

  getOrderHistories(
    url: string,
    access_token: string,
    channel_branch_id?: string,
    merchant_id?: string,
    x_sap_ri?: string
  ): Promise<ResponseListData>;

  getOrderDetail(
    url: string,
    access_token: string,
    order_id: string,
    order_code?: string,
    channel_branch_id?: string,
    merchant_id?: string,
    x_sap_ri?: string
  ): Promise<any>;
}
