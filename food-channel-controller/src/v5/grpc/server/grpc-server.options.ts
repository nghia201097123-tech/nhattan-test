import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";

const retryOptions = {
  max_retries: 3, // Set the maximum number of retries
  initial_backoff_ms: 1000, // Initial backoff time in milliseconds
  max_backoff_ms: 5000, // Maximum backoff time in milliseconds
  backoff_multiplier: 1.5, // Backoff multiplier
  retryable_status_codes: [14], // Status codes to retry
};

export const grpcServerOptions: MicroserviceOptions = {

  transport: Transport.GRPC,
  options: {
    url: `0.0.0.0:${process.env.GRPC_SERVICE_PORT}`,
    package: [
      "vn.techres.microservice.grpc.nodejs_channel_order_food",
      "vn.techres.microservice.grpc.nodejs_order_channel_order_food",
      "vn.techres.microservice.grpc.nodejs_food_channel_setting",

    ],
    protoPath: [
      join(process.cwd(), "src/v5/grpc/protos/channel-order-food-server.proto"),
      join(process.cwd(), "src/v5/grpc/protos/order-channel-order-food-server.proto"),
      join(process.cwd(), "src/v5/grpc/protos/food-channel-setting-server.proto"),
      // join(__dirname,"../protos/channel-order-food-server.proto"),
      // join(__dirname,"../protos/order-channel-order-food-server.proto"),
      // join(__dirname,"../protos/food-channel-setting-server.proto"),

    ],
    loader: {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      arrays : true,

    },
    keepalive: {
      keepaliveTimeMs: 5000,
      keepaliveTimeoutMs: 20000,
      keepalivePermitWithoutCalls: 1,
      ...(retryOptions && { retry: retryOptions }),
    },
  },
};

