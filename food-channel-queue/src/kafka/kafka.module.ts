// import { BullModule } from '@nestjs/bull';
// import { Module } from '@nestjs/common';
// import { ConsumerService } from 'src/kafka/consumer.service';
// import { Consumer } from './consumer';
// import { KafkaService } from './kafka.service';

// @Module({
//   imports: [
//     BullModule.registerQueue({
//       name: 'food_channel_queue',
//     }),
//   ],
//   providers: [KafkaService, ConsumerService, Consumer],
//   exports: [KafkaService, ConsumerService, Consumer],
// })
// export class KafkaModule {}
