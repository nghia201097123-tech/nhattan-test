// import { Module } from "@nestjs/common";
// import { ClientsModule, Transport } from "@nestjs/microservices";
// import { RmqClientService } from "./rmq-client.service";
// import * as dotenv from 'dotenv';
// dotenv.config();
// @Module({
//   imports: [
//     ClientsModule.register([
//       {
//         name: "APP_FOOD_CHANNEL_QUEUE",
//         transport: Transport.RMQ,
//         options: {
//           urls: [`amqp://${process.env.CONFIG_RABBITMQ_USERNAME}:${process.env.CONFIG_RABBITMQ_PASSWORD}@${process.env.CONFIG_RABBITMQ_HOST}:${process.env.CONFIG_RABBITMQ_PORT}`], // Thêm username và password
//           queue: `${process.env.CONFIG_RABBITMQ_QUEUE}`,
//           queueOptions: {
//             durable: false,
//           },
//           socketOptions: {
//             heartbeat: 3,  // Kiểm tra kết nối mỗi 5 giây
//             timeout: 10000, // Timeout là 3000ms (3 giây)
//           },
//           // noAck : true ,
//           // prefetchCount : 1
//         },
//       },
//     ]),
//   ],
//   providers: [RmqClientService],
//   exports: [RmqClientService], // Nếu bạn muốn sử dụng RmqClientService trong các module khác
// })
// export class RmqClientModule {}
