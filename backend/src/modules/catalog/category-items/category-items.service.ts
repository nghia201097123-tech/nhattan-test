import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryItem } from './entities/category-item.entity';

@Injectable()
export class CategoryItemsService {
  constructor(
    @InjectRepository(CategoryItem)
    private repository: Repository<CategoryItem>,
  ) {}

  async findByGroup(groupId: string, isActive?: boolean): Promise<CategoryItem[]> {
    const where: any = { groupId };
    if (isActive !== undefined) where.isActive = isActive;
    return this.repository.find({
      where,
      relations: ['group'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<CategoryItem> {
    const item = await this.repository.findOne({
      where: { id },
      relations: ['group'],
    });
    if (!item) throw new NotFoundException('Category item not found');
    return item;
  }

  async create(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const existing = await this.repository.findOne({
      where: { groupId: data.groupId, code: data.code },
    });
    if (existing) throw new BadRequestException('Code already exists in this group');
    const item = this.repository.create(data);
    return this.repository.save(item);
  }

  async update(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    const item = await this.findById(id);
    Object.assign(item, data);
    return this.repository.save(item);
  }

  async delete(id: string): Promise<void> {
    const item = await this.findById(id);
    await this.repository.remove(item);
  }

  async reorder(groupId: string, itemIds: string[]): Promise<void> {
    for (let i = 0; i < itemIds.length; i++) {
      await this.repository.update(itemIds[i], { sortOrder: i });
    }
  }
}
