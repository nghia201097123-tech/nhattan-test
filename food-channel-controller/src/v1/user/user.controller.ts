// import { Controller } from "@nestjs/common";
// import { GrpcMethod } from "@nestjs/microservices";
// import { BaseListResponseData } from "src/utils.common/utils.response.common/utils.base-list.response.common";
// import { BaseResponseData } from "src/utils.common/utils.response.common/utils.base.response.common";
// import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
// import { User } from "./user.entity/user.enity";
// import { UserService } from "./user.service";
// import { UserResponse } from "./user.response/user.response";
// import { StoreProcedureOutputResultInterface } from "src/utils.common/utils.store-procedure-result.common/utils.store-procedure-output-result.interface.common";
// import { UserOutput } from "./user.output/user.output";
// import { UserOutResponse } from "./user.response/user.output.response";

// @Controller("user")
// export class UserController {
//   constructor(private userService: UserService) {}

//   @GrpcMethod("UserService", "spGUser")
//   async spGUser(): Promise<any> {
//     let response: ResponseData = new ResponseData();
//     response.setData(new UserResponse(await this.userService.spGUser(1)));
//     return response;
//   }

//   @GrpcMethod("UserService", "spGUsers")
//   async spGUsers(): Promise<any> {
//     let response: ResponseData = new ResponseData();
//     response.setData(
//       new UserResponse().mapToList(await this.userService.spGUsers())
//     );
//     return response;
//   }

//   @GrpcMethod("UserService", "spGListUserPagination")
//   async spGListUserPagination(): Promise<any> {
//     let response: BaseResponseData = new BaseResponseData();
//     let result: StoreProcedureOutputResultInterface<User, number> =
//       await this.userService.spGListUserPagination();

//     let data: BaseListResponseData<UserResponse> = new BaseListResponseData(
//       new UserResponse().mapToList(result.list),
//       100,
//       result.total_record
//     );
//     response.setData(data);
//     return response;
//   }

//   @GrpcMethod("UserService", "spGListUserOutput")
//   async spGListUserOutput(): Promise<any> {
//     let response: BaseResponseData = new BaseResponseData();
//     let result: StoreProcedureOutputResultInterface<User, UserOutput> =
//       await this.userService.spGListUserOutput();

//     response.setData(
//       new UserOutResponse(
//         100,
//         result.output,
//         new UserResponse().mapToList(result.list)
//       )
//     );

//     console.log(response);
//     return response;
//   }
// }
