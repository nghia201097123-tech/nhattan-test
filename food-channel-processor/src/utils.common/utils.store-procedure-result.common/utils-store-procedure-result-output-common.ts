import { HttpException, HttpStatus } from "@nestjs/common";
import { ExceptionResponseDetail } from "../utils.exception.common/utils.exception.common";
import { StoreProcedureStatusEnum } from "./utils.store-procedure-status-enum.common";

/**
 *
 */
export class StoreProcedureResultOutput<T> {
  result: T[];

  constructor(result?: T[]) {
    this.result = result ? null : result;
  }

  public getResultOutputPagination(data: any) {
    if (
      data.length < 3 &&
      (parseInt(data[0][0].status) === StoreProcedureStatusEnum.ERROR ||
        parseInt(data[0][0].status) === StoreProcedureStatusEnum.FAIL_LOGIC)
    ) {
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, data[0][0].message),
        HttpStatus.OK
      );
    }
    delete data[2][0].status_code;
    delete data[2][0].message_error;
    return {
      list: data[0],
      total_record: +data[2][0].total_record,
      output: data[2][0].output,
    };
  }

  public getResultOutputList(data: any) {
    if (
      data.length < 3 &&
      (parseInt(data[0][0].status) === StoreProcedureStatusEnum.ERROR ||
        parseInt(data[0][0].status) === StoreProcedureStatusEnum.FAIL_LOGIC)
    ) {
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, data[0][0].message),
        HttpStatus.OK
      );
    }

    delete data[2][0].status_code;
    delete data[2][0].message_error;
    return {
      total_record: +data[2][0].total_record,
      list: data[0],
      output: data[2][0],
    };
  }

  public getResultOutputDetail(data: any) {
    if (
      data.length < 3 &&
      (parseInt(data[1][0].status) === StoreProcedureStatusEnum.ERROR ||
        parseInt(data[1][0].status) === StoreProcedureStatusEnum.FAIL_LOGIC)
    ) {
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, data[0][0].message),
        HttpStatus.OK
      );
    }

    if (data.length === 3 && parseInt(data[0].length) === 0) {
      throw new HttpException(
        new ExceptionResponseDetail(HttpStatus.BAD_REQUEST, "Không tồn tại!"),
        HttpStatus.OK
      );
    }
    delete data[2][0].status_code;
    delete data[2][0].message_error;

    return {
      total_record: 0,
      list: data[0][0],
      output: data[2][0],
    };
  }
}
