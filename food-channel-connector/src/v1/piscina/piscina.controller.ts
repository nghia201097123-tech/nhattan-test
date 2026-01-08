import { Body, Controller, Post } from "@nestjs/common";
import { PiscinaService } from "./piscina.service";

@Controller("piscina")
export class PiscinaController {
  constructor(private readonly appService: PiscinaService) {}

  @Post("process")
  async processData(@Body() data: any): Promise<any> {
    // const result = await this.appService.handleTask(data);
    // let requestTIme = new Date();
    // return {
    //   result: result,
    //   requestTIme: requestTIme,
    //   timeREPONSE: new Date(),
    // };
  }
}
