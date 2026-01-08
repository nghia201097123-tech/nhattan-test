import { User } from "../user.entity/user.enity";
import { UserOutput } from "../user.output/user.output";
import { UserResponse } from "./user.response";

/**
 * 
 */
export class UserOutResponse {
  limit: number;
  total_record: number;
  total_price: number;
  total_amount: number;
  list: UserResponse[];

  /**
   * 
   * @param userOutput 
   * @param user 
   */
  constructor(limit: number, userOutput?: UserOutput, user?: UserResponse[]) {
    this.limit = limit;
    this.total_record = userOutput ? + userOutput.total_record : 0;
    this.total_price = userOutput ? + userOutput.total_price : 0;
    this.total_amount = userOutput ? + userOutput.total_amount : 0;
    this.list = user ? user : [];
  }
}
