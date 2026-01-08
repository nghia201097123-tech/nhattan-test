import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';

@Module({})
@Module({
    imports: [

    ],
    providers: [],
    controllers: [HealthCheckController]
})
export class HealthCheckModule { }
