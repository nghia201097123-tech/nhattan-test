// import { Injectable, OnApplicationShutdown } from "@nestjs/common";
// import {
//   Consumer,
//   ConsumerRunConfig,
//   Kafka,
//   TopicPartitionOffset,
// } from "kafkajs";

// @Injectable()
// export class ConsumerService implements OnApplicationShutdown {
//   private readonly kafka = new Kafka({
//     brokers: [
//       // `${process.env.CONFIG_KAFKA_HOST}:${process.env.CONFIG_KAFKA_PORT}`,
//     ],

//   });
//   private readonly consumers: Consumer[] = [];

//   /**
//    *
//    * @param topic
//    * @param config
//    */

//   async consumerKafka(
//     topic: TopicPartitionOffset,
//     config: ConsumerRunConfig
//   ): Promise<void> {
//     const consumer = this.kafka.consumer({
//       groupId: process.env.CONFIG_KAFKA_GROUP_ID,
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
// }
