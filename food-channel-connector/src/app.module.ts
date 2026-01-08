import { BullModule } from "@nestjs/bull";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthCheckModule } from "./health-check/health-check.module";
import { AppV1Module } from "./v1/app.v1.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    HealthCheckModule,
    AppV1Module,
    BullModule.forRoot({
      redis: {
        host: process.env.CONFIG_REDIS_HOST,
        port: +process.env.CONFIG_REDIS_PORT,
        password: process.env.CONFIG_REDIS_PASSWORD,
        db: 12,
        retryStrategy: (times) => Math.min(times * 100, 3000),
      },
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.CONFIG_MONGO_USERNAME}:${encodeURIComponent(
        process.env.CONFIG_MONGO_PASSWORD
      )}@${process.env.CONFIG_MONGO_HOST}:${process.env.CONFIG_MONGO_PORT}/${
        process.env.CONFIG_MONGO_DB_NAME
      }`,
      { autoIndex: true }
    ),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
