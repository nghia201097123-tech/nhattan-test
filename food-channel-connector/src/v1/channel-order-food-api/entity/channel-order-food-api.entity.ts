import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('channel_order_food_apis')
export class ChannelOrderFoodApiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  channel_order_food_id: number;

  @Column({ length: 255, default: '' })
  name: string;

  @Column({ type: 'text', default: '' })
  url: string;

  @Column({ default: 0 })
  x_foody_entity_id: number;

  @Column({ type: 'text', default: '' })
  body: string;

  @Column({ type: 'tinyint', default: 0 })
  method_type: number;

  @Column({ type: 'int', default: 0 })
  type: number;

}
