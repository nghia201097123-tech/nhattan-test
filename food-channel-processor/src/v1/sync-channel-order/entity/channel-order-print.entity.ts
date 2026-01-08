import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('channel_order_prints')
export class ChannelOrderPrintEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_order_id: number;

  @Column()
  is_printed: number;

  @Column()
  is_cancel_printed: number;

  @Column()
  is_notified: number;
  
}
