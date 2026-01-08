import {
    createParamDecorator,
    ExecutionContext,
    HttpException,
    HttpStatus,
  } from "@nestjs/common";
  import { Metadata } from "@grpc/grpc-js";
  import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
  
  export const AddGrpcMetadata = createParamDecorator(
    (roles: string[], ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const metadata: Metadata = new Metadata();
      const user: string = request.user;
  
      if (!user) {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.UNAUTHORIZED,
            "Token không hợp lệ!"
          ),
          HttpStatus.OK
        );
      }
  
      metadata.add("user", Buffer.from(JSON.stringify(user)).toString("base64"));
  
      return metadata;
    }
  );
  
  