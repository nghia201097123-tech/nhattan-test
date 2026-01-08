import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthCheckModule } from "./health-check/health-check.module";
import { AppV1Module } from "./v1/app.v1.module";
import { AuthenticationMiddleware } from "./utils.common/utils.middleware.common/utils.bearer-token.common";
import { APP_GUARD } from "@nestjs/core";
import { EmployeeModule } from "./v1/employee/employee.module";
import { RedisModule } from "./redis/redis.module";
import { AppV2Module } from "./v2/app.v2.module";
import { AppV3Module } from "./v3/app.v3.module";
import { AppV4Module } from "./v4/app.v4.module";
import { BullModule } from "@nestjs/bull";
import { AppV5Module } from "./v5/app.v5.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    HealthCheckModule,
    // AppV1Module,
    // AppV2Module,
    // AppV3Module,
    AppV4Module,
    AppV5Module,
    EmployeeModule,
    RedisModule,
    BullModule.forRoot({
      redis: {
        host: process.env.CONFIG_REDIS_HOST,
        port: +process.env.CONFIG_REDIS_PORT,
        password: process.env.CONFIG_REDIS_PASSWORD,
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationMiddleware,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: "/public/health-check", method: RequestMethod.ALL },
        { path: "/v1/channel-order-foods/reset-to-test", method: RequestMethod.ALL },
        { path: "/v2/channel-order-foods/reset-to-test", method: RequestMethod.ALL },
        { path: "/v3/channel-order-foods/reset-to-test", method: RequestMethod.ALL },

        )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
