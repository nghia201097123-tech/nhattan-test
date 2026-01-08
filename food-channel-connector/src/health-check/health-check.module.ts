import { forwardRef, Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { RedisModule } from 'src/v1/redis/redis.module';

@Module({})
@Module({
    imports: [
    ],
    providers: [],
    controllers: [HealthCheckController]
})
export class HealthCheckModule { }
