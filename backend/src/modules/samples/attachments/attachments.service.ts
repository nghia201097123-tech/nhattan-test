import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SampleAttachment, FileType } from './entities/sample-attachment.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentsService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    @InjectRepository(SampleAttachment)
    private readonly repository: Repository<SampleAttachment>,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findBySampleId(sampleId: string): Promise<SampleAttachment[]> {
    return this.repository.find({
      where: { sampleId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<SampleAttachment> {
    const attachment = await this.repository.findOne({ where: { id } });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async upload(
    sampleId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<SampleAttachment> {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, 'samples', sampleId, fileName);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Determine file type
    let fileType = FileType.OTHER;
    if (file.mimetype.startsWith('image/')) {
      fileType = FileType.IMAGE;
    } else if (
      file.mimetype.includes('pdf') ||
      file.mimetype.includes('document') ||
      file.mimetype.includes('word')
    ) {
      fileType = FileType.DOCUMENT;
    }

    const attachment = this.repository.create({
      sampleId,
      fileName,
      originalName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileType,
      uploadedBy: userId,
    });

    return this.repository.save(attachment);
  }

  async remove(id: string): Promise<void> {
    const attachment = await this.findById(id);

    // Delete file
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await this.repository.remove(attachment);
  }
}
