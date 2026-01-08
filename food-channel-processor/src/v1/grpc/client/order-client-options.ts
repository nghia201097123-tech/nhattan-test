import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();
export const grpcClientOrderOnline : ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: `${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_ORDER_LEVEL_3_HOST}:${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_ORDER_LEVEL_3_PORT}`,
        package: [
            "vn.techres.microservice.grpc.java.order.order",
            "vn.techres.microservice.grpc.java.java_order_process_three.confirm_order_channel"
        ],
        protoPath: [
            join(
                __dirname,
                "../protos/complete-order.proto"
            ),
            join(
                __dirname,
                "../protos/confirm-order-channel.proto"
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
        keepalive: { keepaliveTimeoutMs: 2000, keepaliveTimeMs: 15000,  keepalivePermitWithoutCalls: 1 },
    },
};
