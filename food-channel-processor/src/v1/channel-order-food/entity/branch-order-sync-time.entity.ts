import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('branch_order_sync_time')
export class BranchOrderSyncTimeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  branch_id: number;

  @Column()
  time: Date;

}
