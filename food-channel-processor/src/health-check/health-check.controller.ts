import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { ResponseData } from "src/utils.common/utils.response.common/utils.response.common";
import { DataSource } from "typeorm";

@Controller("/public")
export class HealthCheckController {
  constructor(private readonly dataSource: DataSource) {}

  @Get("/health-check")
  async healthCheck(@Res() res: Response): Promise<any> {
    let response: ResponseData = new ResponseData();
    response.setData({
      build_number: process.env.CONFIG_BUILD_NUMBER,
      build_time: process.env.CONFIG_BUILD_TIME,
    });
    return res.status(HttpStatus.OK).send(response);
  }

  @Get()
  async testConnection() {
    const queries = Array(20)
      .fill(null)
      .map(async () => {
        return this.dataSource.query("SELECT SLEEP(1)"); // Truy vấn giả lập mất 1 giây
      });

    return Promise.all(queries);
  }
}
