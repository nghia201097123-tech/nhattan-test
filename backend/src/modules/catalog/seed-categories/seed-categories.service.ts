import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeedCategory } from './entities/seed-category.entity';
import { CreateSeedCategoryDto } from './dto/create-seed-category.dto';
import { UpdateSeedCategoryDto } from './dto/update-seed-category.dto';
import { buildTree, generatePath } from '../../../common/utils/tree.util';

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
      throw new NotFoundException('Không tìm thấy nhóm giống');
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
      throw new BadRequestException('Mã nhóm giống đã tồn tại');
    }

    let parentPath: string | null = null;
    let level = 1; // Root level starts at 1

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
        throw new BadRequestException('Mã nhóm giống đã tồn tại');
      }
    }

    // Handle parentId change - normalize values for comparison
    const currentParentId = category.parentId || null;
    const newParentId = dto.parentId !== undefined ? (dto.parentId || null) : currentParentId;
    const parentIdChanged = newParentId !== currentParentId;

    if (parentIdChanged) {
      if (newParentId === null) {
        // Moving to root level
        category.parentId = null;
        category.parent = null;
        category.level = 1;
        category.path = generatePath(null, category.id);
      } else {
        // Check if new parent is not a descendant of current category (prevent circular reference)
        const newParent = await this.findById(newParentId);

        if (newParent.path && newParent.path.includes(`/${id}/`)) {
          throw new BadRequestException('Không thể chọn nhóm con làm nhóm cha');
        }

        category.parentId = newParentId;
        category.parent = newParent;
        category.level = newParent.level + 1;
        category.path = generatePath(newParent.path, category.id);
      }

      // Update all descendants' level and path
      await this.updateDescendants(category);
    }

    // Update other fields
    if (dto.code !== undefined) category.code = dto.code;
    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    category.updatedBy = userId;

    return this.repository.save(category);
  }

  private async updateDescendants(parent: SeedCategory): Promise<void> {
    const children = await this.repository.find({
      where: { parentId: parent.id },
    });

    for (const child of children) {
      child.level = parent.level + 1;
      child.path = generatePath(parent.path, child.id);
      await this.repository.save(child);
      // Recursively update grandchildren
      await this.updateDescendants(child);
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    // Check if has children
    const children = await this.getChildren(id);
    if (children.length > 0) {
      throw new BadRequestException('Không thể xóa nhóm giống đang có nhóm con');
    }

    await this.repository.remove(category);
  }

  async reorder(items: { id: string; sortOrder: number }[]): Promise<void> {
    for (const item of items) {
      await this.repository.update(item.id, { sortOrder: item.sortOrder });
    }
  }
}
