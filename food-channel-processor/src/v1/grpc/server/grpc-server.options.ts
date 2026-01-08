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
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.channel_order_food",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.order_channel_order_food",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.branch_channel_food_commission_percent_map",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.channel_order_food_token",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.channel_order_food_report",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.channel_order",
      "vn.techres.microservice.grpc.nodejs_food_channel_processor.food_channel_setting"

    ],
    protoPath: [
      join(__dirname,"../protos/channel-order-food.proto"),
      join(__dirname,"../protos/order-channel-order-food.proto"),
      join(__dirname,"../protos/branch-channel-food-commission-percent-map.proto"),
      join(__dirname,"../protos/channel-order-food-token.proto"),
      join(__dirname,"../protos/channel-order-food-report.proto"),
      join(__dirname,"../protos/channel-order.proto"),
      join(__dirname,"../protos/food-channel-setting.proto"),

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

