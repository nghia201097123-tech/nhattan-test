// src/channel-order-food.entity.ts

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'channel_order_foods' })
export class ChannelOrderFoodEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  code: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  image_url: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

}
