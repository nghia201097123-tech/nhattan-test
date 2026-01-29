import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportReason } from './entities/export-reason.entity';

@Injectable()
export class ExportReasonsService {
  constructor(
    @InjectRepository(ExportReason)
    private repository: Repository<ExportReason>,
  ) {}

  async findAll(isActive?: boolean): Promise<ExportReason[]> {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    return this.repository.find({
      where,
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<ExportReason> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Export reason not found');
    return item;
  }

  async create(data: Partial<ExportReason>): Promise<ExportReason> {
    const existing = await this.repository.findOne({ where: { code: data.code } });
    if (existing) throw new BadRequestException('Code already exists');
    const item = this.repository.create(data);
    return this.repository.save(item);
  }

  async update(id: string, data: Partial<ExportReason>): Promise<ExportReason> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.repository.remove(item);
  }
}
