// import { Injectable, OnApplicationShutdown } from "@nestjs/common";
// import { TopicPartitionOffset } from "@nestjs/microservices/external/kafka.interface";
// import { Consumer, ConsumerRunConfig, Kafka } from "kafkajs";

// @Injectable()
// export class ConsumerService implements OnApplicationShutdown {
//   private readonly kafka = new Kafka({
//     brokers: [
//       `${process.env.CONFIG_KAFKA_HOST}:${process.env.CONFIG_KAFKA_PORT}`,
//     ],
//   });
//   private readonly consumers: Consumer[] = [];

//   /**
//    *
//    * @param topic
//    * @param config
//    */

//   async consumerChannelOrder(
//     topic: TopicPartitionOffset,
//     config: ConsumerRunConfig
//   ): Promise<void> {
//     const consumer = this.kafka.consumer({
//       groupId: process.env.CONFIG_KAFKA_GROUP_ID,
//       sessionTimeout: 30000, // Đây là khoảng thời gian mà Kafka broker sẽ chờ nhận heartbeat từ consumer trước khi coi consumer là không còn hoạt động. Nếu consumer không gửi heartbeat trong thời gian này, Kafka sẽ ngắt kết nối nó khỏi nhóm.
//       heartbeatInterval: 10000, // Đây là khoảng thời gian mà Kafka consumer gửi heartbeat đến broker để duy trì kết nối.
//       retry: {
//         retries: 10, // 10 lần retry
//       },
//     });
//     await consumer.connect();
//     await consumer.subscribe(topic);
//     await consumer.run(config);
//     this.consumers.push(consumer);
//   }
//   async onApplicationShutdown() {
//     // @ts-ignore
//     for (const consumer: Consumer of this.consumers) {
//       await consumer.disconnect();
//     }
//   }

//   async consumerChannelOrderApp(
//     topic: TopicPartitionOffset,
//     config: ConsumerRunConfig
//   ): Promise<void> {
//     const consumer = this.kafka.consumer({
//       // groupId: 'sync-connector-channel-order-app-food',
//       groupId: process.env.CONFIG_KAFKA_GROUP_ID,
//       sessionTimeout: 30000, // Đây là khoảng thời gian mà Kafka broker sẽ chờ nhận heartbeat từ consumer trước khi coi consumer là không còn hoạt động. Nếu consumer không gửi heartbeat trong thời gian này, Kafka sẽ ngắt kết nối nó khỏi nhóm.
//       heartbeatInterval: 10000, // Đây là khoảng thời gian mà Kafka consumer gửi heartbeat đến broker để duy trì kết nối.
//       retry: {
//         retries: 10, // 10 lần retry
//       },
//     });
//     await consumer.connect();
//     await consumer.subscribe(topic);
//     await consumer.run(config);
//     this.consumers.push(consumer);
//   }
  
// }
