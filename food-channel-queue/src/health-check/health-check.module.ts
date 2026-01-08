import { Module } from "@nestjs/common";
import { HealthCheckController } from "./health-check.controller";
import { RedisModule } from "src/redis/redis.module";

@Module({})
@Module({
  imports: [RedisModule],
  providers: [],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
