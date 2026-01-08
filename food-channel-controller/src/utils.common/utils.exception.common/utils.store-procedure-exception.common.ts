import { HttpException, HttpStatus } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { StoreProcedureStatusEnum } from "../utils.store-procedure-result.common/utils.store-procedure-status-enum.common";
import { ExceptionResponseDetail } from "./utils.exception.common";

export class ExceptionStoreProcedure {
  data: any;
  constructor(data: any) {
    this.data = data;
  }
  static validate(data: any): boolean {
    if (!data) {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.BAD_REQUEST,
          "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!"
        ),
        HttpStatus.OK
      );
    }

    if (
      data.length < 3 &&
      (parseInt(data[1][0].status_code) === StoreProcedureStatusEnum.ERROR ||
        parseInt(data[1][0].status_code) ===
          StoreProcedureStatusEnum.FAIL_LOGIC)
    ) {
      throw new HttpException(
        new ExceptionResponseDetail(
          HttpStatus.BAD_REQUEST,
          data[1][0].message_error
        ),
        HttpStatus.OK
      );
    }
    return true;
  }

  static validateEmptyDetail(data: any): boolean {
    if (
      data.length < 3 &&
      data[1][0].status_code != StoreProcedureStatusEnum.SUCCESS
    ) {
      let textShow: string = data[1][0].message_error;
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, textShow),
        HttpStatus.OK
      );
    }
    if (data.length === 3 && data[0].length === 0) {
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, "Không tồn tại"),
        HttpStatus.OK
      );
    }
    return true;
  }

}
