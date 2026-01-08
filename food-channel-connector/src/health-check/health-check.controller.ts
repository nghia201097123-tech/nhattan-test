import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from "express";
import { ResponseData } from 'src/utils.common/utils.response.common/utils.response.common';
import { RedisService } from 'src/v1/redis/redis.service';

@Controller('/public')
export class HealthCheckController {
    constructor(
    ) { }

    @Get("/health-check")
    async healthCheck(
        @Res() res: Response,
    ): Promise<any> {
        let response: ResponseData = new ResponseData();
        response.setData({
            "build_number": process.env.CONFIG_BUILD_NUMBER,
            "build_time": process.env.CONFIG_BUILD_TIME
        })        

        return res.status(HttpStatus.OK).send(response);
    }
}
