// import {
//   CanActivate,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
//   NestMiddleware,
// } from "@nestjs/common";
// import {
//   ClientGrpc,
//   ClientProxyFactory,
//   Transport,
// } from "@nestjs/microservices";
// import { Reflector } from "@nestjs/core";
// import { NextFunction, Request, Response } from "express";
// import { ROLES_KEY, Role } from "src/utils.common/utils.enum/role.enum";
// import { DecodeToken } from "../utils.decode-token.common/utils.decode-token.common";
// import { Account } from "../utils.enum/utils.account.enum";
// import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
// import { join } from "path";
// import { UserValidateTokenDTO } from "./user-validate-token.dto";
// import { lastValueFrom } from "rxjs";
// import { EmployeeService } from "src/v1/employee/employee.service";
// import { EmployeeEntity } from "src/v1/employee/entity/employee.entity";

// interface ValidateTokenService {
//   isValid(data: { token: string });
// }

// @Injectable()
// export class AuthenticationMiddleware implements NestMiddleware, CanActivate {
//   private client: ClientGrpc;
//   private validateTokenService: ValidateTokenService;

//   constructor(
//     private employeeService: EmployeeService,
//     private reflector: Reflector
//   ) {
//     this.client = this.createClient();
//     this.validateTokenService = this.client.getService<ValidateTokenService>(
//       "ValidateTokenService"
//     );

//   }

//   private createClient(): ClientGrpc {
//     return ClientProxyFactory.create({
//       transport: Transport.GRPC,
//       options: {
//         url: `${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_HOST}:${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_PORT}`,
//         package:
//           "vn.techres.microservice.grpc.java.net_techres_oauth.validate.token",
//         protoPath: join(__dirname,"../utils.middleware.common/validate-token.proto"
//         ),
//         loader: {
//           keepCase: true,
//         },
//       },
//     });
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (!requiredRoles) {
//       return true;
//     }
//     const { user } = context.switchToHttp().getRequest();

//     if (user instanceof EmployeeEntity) {
//       const listPrivilege: Array<String> = user.privilege_tags.map(
//         (x) => x["code"]
//       );

//       if (listPrivilege.includes("OWNER")) {
//         return true;
//       } else if (!requiredRoles.some((role) => listPrivilege?.includes(role))) {
//         throw new HttpException(
//           new ExceptionResponseDetail(
//             HttpStatus.FORBIDDEN,
//             "Bạn không có quyền truy cập vào chức năng này!"
//           ),
//           HttpStatus.OK
//         );
//       }
//     }

//     return true;
//   }
// async use(req: Request, res: Response, next: NextFunction) {
//     let bearerToken: string = req.headers.authorization;    

//     if (!bearerToken || bearerToken === "") {
//       throw new HttpException(
//         new ExceptionResponseDetail(
//           HttpStatus.BAD_REQUEST,
//           "Kiểm tra lại xem bạn đã truyền token vào chưa!"
//         ),
//         HttpStatus.OK
//       );
//     }

//     let token: string = await new DecodeToken().splitBearerToken(bearerToken);
    
//     const userValidateTokenDTO: UserValidateTokenDTO = await lastValueFrom(
//       await this.validateTokenService.isValid({
//         token: token,
//       })
//     );    

//     let employee: EmployeeEntity;   
//     switch (+userValidateTokenDTO.data.platform) {
//       case Account.CUSTOMER:
//         break;

//       case Account.RESTAURANT:
//         employee = await this.employeeService.findById(
//           userValidateTokenDTO.data.user_id
//         );
//         break;

//       default:
//         throw new HttpException(
//           new ExceptionResponseDetail(
//             HttpStatus.BAD_REQUEST,
//             "Token bạn truyền vào không hợp lệ!"
//           ),
//           HttpStatus.OK
//         );
//     }
    
//     req.user = employee;

//     next();
//   }


// }