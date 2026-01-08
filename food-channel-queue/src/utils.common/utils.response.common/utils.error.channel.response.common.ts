import { HttpStatus } from "@nestjs/common";

export class ErrorChannelResponseData {
  private code: string;
  private message: string;

  constructor(code: string = null, message: string = null) {
    this.code = code ? code : "";
    this.message = message ? message : "SUCCESS";
  }
}
