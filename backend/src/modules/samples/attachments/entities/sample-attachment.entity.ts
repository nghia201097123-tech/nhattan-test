import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sample } from '../../collection/entities/sample.entity';
import { User } from '../../../users/entities/user.entity';

export enum FileType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

@Entity('sample_attachments')
export class SampleAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample, (sample) => sample.attachments)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'file_type', type: 'enum', enum: FileType, nullable: true })
  fileType: FileType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}
