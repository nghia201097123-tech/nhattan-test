import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Location, (location) => location.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Location;

  @OneToMany(() => Location, (location) => location.parent)
  children: Location[];

  @Column({ length: 20 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column()
  level: number; // 1: Tỉnh, 2: Huyện, 3: Xã

  @Column({ length: 500, nullable: true })
  path: string;

  @Column({ name: 'full_path_name', length: 500, nullable: true })
  fullPathName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
