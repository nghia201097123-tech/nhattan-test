import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from './entities/category-group.entity';

@Injectable()
export class CategoryGroupsService {
  constructor(
    @InjectRepository(CategoryGroup)
    private repository: Repository<CategoryGroup>,
  ) {}

  async findAll(isActive?: boolean): Promise<CategoryGroup[]> {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    return this.repository.find({
      where,
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<CategoryGroup> {
    const item = await this.repository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!item) throw new NotFoundException('Category group not found');
    return item;
  }

  async findByCode(code: string): Promise<CategoryGroup> {
    const item = await this.repository.findOne({
      where: { code },
      relations: ['items'],
    });
    if (!item) throw new NotFoundException('Category group not found');
    return item;
  }

  async create(data: Partial<CategoryGroup>): Promise<CategoryGroup> {
    const existing = await this.repository.findOne({ where: { code: data.code } });
    if (existing) throw new BadRequestException('Code already exists');
    const item = this.repository.create(data);
    return this.repository.save(item);
  }

  async update(id: string, data: Partial<CategoryGroup>): Promise<CategoryGroup> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);
    if (item.isSystem) {
      throw new BadRequestException('Cannot delete system category group');
    }
    await this.repository.remove(item);
  }
}
