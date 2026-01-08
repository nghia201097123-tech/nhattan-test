import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('channel_order_drivers')
export class ChannelOrderDriverEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_order_id: number;

  @Column()
  driver_name: string;

  @Column()
  driver_phone: string;

  @Column()
  status_string: string;

  @Column()
  order_status: number;
}
