import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SeedCategory } from './entities/seed-category.entity';
import { CreateSeedCategoryDto } from './dto/create-seed-category.dto';
import { UpdateSeedCategoryDto } from './dto/update-seed-category.dto';
import { buildTree, generatePath, getLevel } from '../../../common/utils/tree.util';

@Injectable()
export class SeedCategoriesService {
  constructor(
    @InjectRepository(SeedCategory)
    private readonly repository: Repository<SeedCategory>,
  ) {}

  async findAll(isActive?: boolean): Promise<SeedCategory[]> {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.repository.find({
      where,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getTree(): Promise<any[]> {
    const categories = await this.findAll(true);
    return buildTree(categories as any);
  }

  async findById(id: string): Promise<SeedCategory> {
    const category = await this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Seed category not found');
    }

    return category;
  }

  async getChildren(id: string): Promise<SeedCategory[]> {
    return this.repository.find({
      where: { parentId: id, isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateSeedCategoryDto, userId: string): Promise<SeedCategory> {
    // Check unique code
    const existing = await this.repository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Category code already exists');
    }

    let parentPath: string = null;
    let level = 0;

    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      parentPath = parent.path;
      level = parent.level + 1;
    }

    const category = this.repository.create({
      ...dto,
      level,
      createdBy: userId,
    });

    const saved = await this.repository.save(category);

    // Update path after save to have the ID
    saved.path = generatePath(parentPath, saved.id);
    await this.repository.save(saved);

    return saved;
  }

  async update(id: string, dto: UpdateSeedCategoryDto, userId: string): Promise<SeedCategory> {
    const category = await this.findById(id);

    if (dto.code && dto.code !== category.code) {
      const existing = await this.repository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new BadRequestException('Category code already exists');
      }
    }

    Object.assign(category, dto, { updatedBy: userId });
    return this.repository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    // Check if has children
    const children = await this.getChildren(id);
    if (children.length > 0) {
      throw new BadRequestException('Cannot delete category with children');
    }

    await this.repository.remove(category);
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of items) {
      await this.repository.update(item.id, { sortOrder: item.sortOrder });
    }
  }
}
