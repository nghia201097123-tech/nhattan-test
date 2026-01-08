// import {
//   Injectable,
//   OnApplicationShutdown,
//   OnModuleInit,
// } from "@nestjs/common";
// import { Admin, Consumer, Kafka, Producer, ProducerRecord } from "kafkajs";

// @Injectable()
// export class KafkaService implements OnModuleInit, OnApplicationShutdown {
//   private readonly kafka = new Kafka({
//     brokers: [
//       `${process.env.CONFIG_KAFKA_HOST}:${process.env.CONFIG_KAFKA_PORT}`,
//     ],
//   });
//   private readonly producer: Producer = this.kafka.producer();
//   private consumer: Consumer;
//   private readonly admin: Admin = this.kafka.admin();

//   async onModuleInit() {
//     try {
//       await this.producer.connect();
//     } catch (error) {
//       console.error("Failed to connect to Kafka server:", error);
//     }
//   }

//   async produce(record: ProducerRecord) {
//     await this.producer.send(record);
//   }

//   async onApplicationShutdown(signal?: string) {
//     await this.disconnect();
//   }

//   async disconnect() {
//     try {
//       await this.producer.disconnect();
//       if (this.consumer) {
//         await this.consumer.disconnect();
//       }
//       console.log("Disconnected from Kafka server");
//     } catch (error) {
//       console.error("Error while disconnecting from Kafka server:", error);
//     }
//   }

//   async increasePartitions(topicName: string, numPartitions: number) {
//     const existingTopicMetadata = await this.admin.fetchTopicMetadata({
//       topics: [topicName],
//     });
//     const existingPartitions =
//       existingTopicMetadata.topics[0].partitions.length;

//     if (existingPartitions < numPartitions) {
//       await this.admin.createPartitions({
//         topicPartitions: [
//           {
//             topic: topicName,
//             count: numPartitions,
//           },
//         ],
//       });
//       console.log(
//         `Partition count of topic ${topicName} increased to ${numPartitions}`
//       );
//     } else {
//       console.log(
//         `Topic ${topicName} already has ${existingPartitions} partitions.`
//       );
//     }
//   }
// }
