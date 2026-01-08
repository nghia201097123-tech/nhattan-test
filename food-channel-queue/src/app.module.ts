import { BullModule } from '@nestjs/bull';
import { ConfigModule } from "@nestjs/config";
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthCheckModule } from './health-check/health-check.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.CONFIG_REDIS_HOST,
        port: +process.env.CONFIG_REDIS_PORT,
        password: process.env.CONFIG_REDIS_PASSWORD,
        db: 12,
      },
    }),
    HealthCheckModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { }
}