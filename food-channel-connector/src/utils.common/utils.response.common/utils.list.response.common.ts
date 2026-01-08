import { HttpStatus } from "@nestjs/common";

export class ResponseListData {
  private status: HttpStatus;
  private message: string;
  private list: any[];

  constructor(status: number = null, message: string = null, list?: any[]) {
    this.status = status ? +status : +HttpStatus.OK;
    this.message = message ? message : "SUCCESS";
    this.list =  list ?? [];
  }

  public getStatus(): HttpStatus {
    return this.status;
  }

  public setStatus(status: HttpStatus): void {
    this.status = status;
  }

  public getMessage(): string {
    return this.message;
  }

  public setMessage(status: HttpStatus, message: string): void {
    if (message) {
      this.message = message;
    } else {
      switch (status) {
        case HttpStatus.OK:
          this.message = "SUCCESS";
          break;
        case HttpStatus.BAD_REQUEST:
          this.message = "Dữ liệu không hợp lệ";
          break;
        default:
          this.message = "SUCCESS";
          break;
      }
    }
  }

  public getList(): any[] {
    return this.list;
  }

  public setList(list : any[]): void {    
    this.list = list;
  }
}
