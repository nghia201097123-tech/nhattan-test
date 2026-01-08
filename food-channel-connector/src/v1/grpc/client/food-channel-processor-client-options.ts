import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();
export const grpcClientFoodChannelProcessorClientOptions : ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: `${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_HOST}:${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_PORT}`,
        package: [
            "vn.techres.microservice.grpc.nodejs_food_channel_processor.channel_order"
        ],
        protoPath: [
            // join(__dirname,"../protos/channel-order.proto"),

            join(process.cwd(), "src/v1/grpc/protos/channel-order.proto"),
        ],
        loader: {
            keepCase: true,
            arrays : true,
        },
        channelOptions: {
            "grpc.default_deadline_ms": 2000,
            "grpc.initial_reconnect_backoff_ms": 2000,
            "grpc.service_config": JSON.stringify({
                methodConfig: [
                    {
                        name: [],
                        timeout: { seconds: 10, nanos: 0 },
                        retryPolicy: {
                            maxAttempts: 5,
                            initialBackoff: "0.1s",
                            maxBackoff: "30s",
                            backoffMultiplier: 3,
                            retryableStatusCodes: ["UNAVAILABLE"],
                        },
                    },
                ],
            }),
        },
        keepalive: { keepaliveTimeoutMs: 2000, keepaliveTimeMs: 5000,  keepalivePermitWithoutCalls: 1 },
    },
};
