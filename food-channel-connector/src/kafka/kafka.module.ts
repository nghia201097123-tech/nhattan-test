// import { forwardRef, Module } from "@nestjs/common";
// import { ConsumerService } from "src/kafka/consumer.service";
// import { Consumer } from "./consumer";
// import { KafkaService } from "./kafka.service";
// import { ChannelOrderModule } from "src/v1/channel-order/channel-order.module";
// import { BullModule } from "@nestjs/bull";
// import { PiscinaModule } from "src/v1/piscina/piscina.module";

// @Module({
//   imports: [
//     forwardRef(() => ChannelOrderModule),
//     forwardRef(() => PiscinaModule),
//     BullModule.registerQueue({
//       name: "food_channel_sync_channel_orders",
//     }),
//     forwardRef(() => PiscinaModule),
//   ],
//   providers: [KafkaService, ConsumerService, Consumer],
//   exports: [KafkaService, ConsumerService, Consumer]
// })
// export class KafkaModule {
// }
