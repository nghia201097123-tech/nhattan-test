import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Location } from './entities/location.entity';
import { buildTree } from '../../../common/utils/tree.util';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
  ) {}

  async findAll(level?: number): Promise<Location[]> {
    const where: any = { isActive: true };
    if (level) {
      where.level = level;
    }

    return this.repository.find({
      where,
      order: { level: 'ASC', name: 'ASC' },
    });
  }

  async getTree(): Promise<any[]> {
    const locations = await this.findAll();
    return buildTree(locations as any);
  }

  async getProvinces(): Promise<Location[]> {
    return this.repository.find({
      where: { level: 1, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getChildren(id: string): Promise<Location[]> {
    return this.repository.find({
      where: { parentId: id, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Location> {
    const location = await this.repository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }
}
