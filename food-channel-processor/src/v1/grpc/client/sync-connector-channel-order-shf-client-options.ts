import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();
export const grpcClientSyncConnectorChannelOrderShf : ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: `${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_CONNECTOR_SHOPEEFOOD_HOST}:${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_CONNECTOR_SHOPEEFOOD_PORT}`,
        package: [
            "vn.techres.microservice.grpc.nodejs_food_channel_connector.sync_connector_channel_order",
            "vn.techres.microservice.grpc.nodejs_food_channel_connector.channel_order_api"
        ],
        protoPath: [
            join(
                __dirname,
                "../protos/sync-connector-channel-order.proto"
            ),
            join(
                __dirname,
                "../protos/channel-order-food-api.proto"
            )
        ],
        loader: {
            keepCase: true,
            arrays : true
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
