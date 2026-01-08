import { HttpException, HttpStatus } from "@nestjs/common";
import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
import { DecodeBearerTokenInterFace } from "./utils.decode-token.interface.common";
import * as jwt from "jsonwebtoken";

export class DecodeToken {
  token: string;
  secret_key: string;

  constructor(token: string = "", secret_key: string = "") {
    this.token = token;
    this.secret_key = secret_key;
  }

  /**
   *
   * @param token
   * @param secretKey
   * @returns
   */
  public verifyBearerToken = async (
    bearerToken: string,
    secretKey: string
  ): Promise<DecodeBearerTokenInterFace> => {
    let decodeBearerTokenInterFace: DecodeBearerTokenInterFace;

    if (!bearerToken || bearerToken === "") {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.BAD_REQUEST,
          "Token không hợp lệ!"
        ),
        HttpStatus.OK
      );
    } else {
      let token: string = await this.splitBearerToken(bearerToken);
      decodeBearerTokenInterFace = Object(await jwt.decode(token));
      decodeBearerTokenInterFace.jwt_token = token
    }

    return decodeBearerTokenInterFace;
  };

  /**
   *
   * @param token
   * @param secretKey
   * @returns
   */
  splitBearerToken = (token: string): string => {
    let splitToken: string;
    
    if (!token || token === "") {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.BAD_REQUEST,
          "Token không hợp lệ!"
        ),
        HttpStatus.OK
      );
    } else {
      splitToken = token.split(" ")[1];


      if (!splitToken || splitToken === "") {
        throw new HttpException(
          new ExceptionResponseDetail(
            HttpStatus.BAD_REQUEST,
            "Token không hợp lệ!"
          ),
          HttpStatus.OK
        );
      }
    }

    return splitToken;
  };
}
