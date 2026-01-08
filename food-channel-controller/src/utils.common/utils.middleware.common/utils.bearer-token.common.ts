import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import {
  ClientGrpc,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { Reflector } from "@nestjs/core";
import { NextFunction, Request, Response } from "express";
import { ROLES_KEY, Role } from "src/utils.common/utils.enum/role.enum";
import { DecodeToken } from "../utils.decode-token.common/utils.decode-token.common";
import { Account } from "../utils.enum/utils.account.enum";
import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
import { join } from "path";
import { UserValidateTokenDTO } from "./user-validate-token.dto";
import { lastValueFrom } from "rxjs";
import { EmployeeEntity } from "src/v1/employee/entity/employee.entity";
import { RedisService } from "src/redis/redis.service";

interface ValidateTokenService {
  isValid(data: { token: string });
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware, CanActivate {
  private client: ClientGrpc;
  private validateTokenService: ValidateTokenService;

  constructor(
    private reflector: Reflector,
    private redisService: RedisService

  ) {
    this.client = this.createClient();
    this.validateTokenService = this.client.getService<ValidateTokenService>(
      "ValidateTokenService"
    );

  }

  private createClient(): ClientGrpc {
    return ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        url: `${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_HOST}:${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_OAUTH_PORT}`,
        package:
          "vn.techres.microservice.grpc.java.net_techres_oauth.validate.token",
        protoPath: join(process.cwd(), "src/utils.common/utils.middleware.common/validate-token.proto"),
        loader: {
          keepCase: true,
        },
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (user instanceof EmployeeEntity) {
      const listPrivilege: Array<String> = user.privilege_tags.map(
        (x) => x["code"]
      );

      if (listPrivilege.includes("OWNER")) {
        return true;
      } else if (!requiredRoles.some((role) => listPrivilege?.includes(role))) {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.FORBIDDEN,
            "Bạn không có quyền truy cập vào chức năng này!"
          ),
          HttpStatus.OK
        );
      }
    }

    return true;
  }
async use(req: Request, res: Response, next: NextFunction) {
    let bearerToken: string = req.headers.authorization;    

    if (!bearerToken || bearerToken === "") {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.BAD_REQUEST,
          "Kiểm tra lại xem bạn đã truyền token vào chưa!"
        ),
        HttpStatus.OK
      );
    }

    let token: string = await new DecodeToken().splitBearerToken(bearerToken);

    let keyCheckToken = `food_channel_controller:check-token-${token}`;    

    let keyCheckTokenValue = await this.redisService.getKey(keyCheckToken);

    if(!keyCheckTokenValue){
      
      const userValidateTokenDTO: UserValidateTokenDTO = await lastValueFrom(
        await this.validateTokenService.isValid({
          token: token,
        })
      );    

      switch (+userValidateTokenDTO.data.platform) {
        case Account.CUSTOMER:
          break;

        case Account.RESTAURANT:
          // userValidateTokenDTO
          break;

        default:
          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              "Token bạn truyền vào không hợp lệ!"
            ),
            HttpStatus.OK
          );
      }

      await this.redisService.setKeyCheckToken(keyCheckToken,JSON.stringify(userValidateTokenDTO.data));    

      req.user = userValidateTokenDTO.data;      

    }else{
      req.user = JSON.parse(keyCheckTokenValue);
    }  

    next();
  }


}