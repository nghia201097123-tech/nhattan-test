import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { HealthCheckModule } from "./health-check/health-check.module";
import { AppV1Module } from "./v1/app.v1.module";
import { ScheduleAppModule } from "./schedule/schedule.module";
import { RedisModule } from "./redis/redis.module";
import { MongooseModule } from '@nestjs/mongoose';
import { CustomElasticsearchModule } from "./v1/elasticsearch/elasticsearch.module";
import { BullModule } from "@nestjs/bull";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mariadb",
      host: process.env.CONFIG_MYSQL_HOST_TECHRES_CHANNEL_FOOD,
      port: parseInt(process.env.CONFIG_MYSQL_PORT_TECHRES_CHANNEL_FOOD),
      username: process.env.CONFIG_MYSQL_USERNAME_TECHRES_CHANNEL_FOOD,
      password: process.env.CONFIG_MYSQL_PASSWORD_TECHRES_CHANNEL_FOOD,
      database: process.env.CONFIG_MYSQL_DB_NAME_TECHRES_CHANNEL_FOOD,
      entities: ['dist/**/*.entity{.ts,.js}'],
      multipleStatements: true,
      dateStrings: true,
      extra: {
        connectTimeout: + (process.env.CONFIG_MYSQL_CONNECTION_TIMEOUT ?? 2000),
        min: + (process.env.CONFIG_MYSQL_CONNECTION_POOL_MIN_IDLE ?? 10 ), 
        connectionLimit: + (process.env.CONFIG_MYSQL_CONNECTION_POOL_MAX_SIZE ?? 10), // giới hạn tối đa
        idleTimeoutMillis:
          +(process.env.CONFIG_MYSQL_CONNECTION_POOL_IDLE_TIMEOUT ?? 2000),
        waitForConnections: true, // Chờ nếu pool đã đạt giới hạn
      }, 
    }),
    MongooseModule.forRoot(
      `mongodb://${process.env.CONFIG_MONGO_USERNAME
      }:${encodeURIComponent(
        process.env.CONFIG_MONGO_PASSWORD
      )}@${process.env.CONFIG_MONGO_HOST}:${process.env.CONFIG_MONGO_PORT
      }/${process.env.CONFIG_MONGO_DB_NAME}`,
      { autoIndex: true }
    ),
    BullModule.forRoot({
      redis: {
        host: process.env.CONFIG_REDIS_HOST,
        port: +process.env.CONFIG_REDIS_PORT,
        password: process.env.CONFIG_REDIS_PASSWORD,
        db: 12,
      },
    }),
    HealthCheckModule,
    AppV1Module,
    ScheduleAppModule,
    RedisModule,
    CustomElasticsearchModule
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .exclude(
        { path: '/public/health-check', method: RequestMethod.ALL },

        { path: '*', method: RequestMethod.ALL }
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
