import { ClientOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();
export const grpcClientDashboard : ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: `${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_DASHBOARD_HOST}:${process.env.CONFIG_GRPC_JAVA_NET_TECHRES_DASHBOARD_PORT}`,
        package: [
            "vn.techres.microservice.grpc.java.dashboard.branch_channel_food_branch_map",
            "vn.techres.microservice.grpc.java.dashboard.branch_food_map_food_channel"
        ],
        protoPath: [
            join(
                __dirname,
                "../protos/branch-channel-food-branch-map.proto"
            ),
            join(
                __dirname,
                "../protos/branch-food-map-food-channel.proto"
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
        keepalive: { keepaliveTimeoutMs: 2000, keepaliveTimeMs: 5000,  keepalivePermitWithoutCalls: 1 },
    },
};
