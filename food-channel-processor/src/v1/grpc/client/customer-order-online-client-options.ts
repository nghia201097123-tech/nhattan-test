import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();
export const grpcClientCustomerOrderOnline : ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: `${process.env.CONFIG_GRPC_JAVA_CUSTOMER_ORDER_ONLINE_HOST}:${process.env.CONFIG_GRPC_JAVA_CUSTOMER_ORDER_ONLINE_PORT}`,
        package: [
            "vn.techres.microservice.grpc.java.customer_order_online.customer_order_for_channel_food"
        ],
        protoPath: [
            join(
                __dirname,
                "../protos/customer-order-for-channel-food.proto"
            )
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
                        timeout: { seconds: 3, nanos: 0 },
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
