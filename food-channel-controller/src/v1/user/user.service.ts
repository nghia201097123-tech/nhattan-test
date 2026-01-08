// import { Injectable } from "@nestjs/common";
// import { ExceptionStoreProcedure } from "src/utils.common/utils.exception.common/utils.store-procedure-exception.common";
// import { StoreProcedureResult } from "src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result.common";
// import { Repository } from "typeorm";
// import { User } from "./user.entity/user.enity";
// import { InjectRepository } from "@nestjs/typeorm";
// import { StoreProcedureOutputResultInterface } from "src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common";
// import { StoreProcedureResultOutput } from "src/utils.common/utils.store-procedure-result.common/utils-store-procedure-result-output-common";
// import { UserOutput } from "./user.output/user.output";

// @Injectable()
// export class UserService {
//   constructor(
//     @InjectRepository(User)
//     private userRepository: Repository<User>
//   ) {}

//   async spGUser(id: number): Promise<User> {
//     let user: User = await this.userRepository.query(
//       "CALL sp_g_user(?, @status, @message); SELECT @status AS status , @message AS message",
//       [id]
//     );
//     ExceptionStoreProcedure.validateEmptyDetail(user);
//     return new StoreProcedureResult<User>().getResultDetail(user);
//   }

//   async spGUsers(): Promise<User[]> {
//     let users: User = await this.userRepository.query(
//       "CALL sp_g_users(@status, @message); SELECT @status AS status , @message AS message",
//       []
//     );
//     ExceptionStoreProcedure.validateEmptyDetail(users);

//     return new StoreProcedureResult<User[]>().getResultList(users);
//   }

//   async spGListUserPagination(): Promise<
//     StoreProcedureOutputResultInterface<User, number>
//   > {
//     let users: User = await this.userRepository.query(
//       "CALL sp_g_list_user_pagination(@totalRecord, @status, @message); SELECT  @totalRecord AS total_record, @status AS status , @message AS message",
//       []
//     );
//     ExceptionStoreProcedure.validate(users);

//     let data: StoreProcedureOutputResultInterface<User, number> =
//       new StoreProcedureResultOutput<number>().getResultOutputPagination(users);

//     return data;
//   }

//   async spGListUserOutput(): Promise<
//     StoreProcedureOutputResultInterface<User, UserOutput>
//   > {
//     let users: User = await this.userRepository.query(
//       `CALL sp_g_list_user_output(@totalRecord, @totalAmount, @totalPrice, @status, @message); 
//       SELECT  @totalRecord AS total_record, @totalAmount AS total_amount, @totalPrice AS total_price, @status AS status , @message AS message`,
//       []
//     );
//     ExceptionStoreProcedure.validate(users);

//     let data: StoreProcedureOutputResultInterface<User, UserOutput> =
//       new StoreProcedureResultOutput<UserOutput>().getResultOutputList(users);

//     return data;
//   }
// }
