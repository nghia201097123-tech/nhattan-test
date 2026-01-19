import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation, StorageLocationStatus, StorageLocationType } from './entities/storage-location.entity';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';
import { buildTree, generatePath } from '../../../common/utils/tree.util';

@Injectable()
export class StorageLocationsService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly repository: Repository<StorageLocation>,
  ) {}

  async findAll(warehouseId?: string): Promise<StorageLocation[]> {
    const where: any = {};
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    return this.repository.find({
      where,
      order: { level: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getTree(warehouseId: string): Promise<any[]> {
    const locations = await this.findAll(warehouseId);
    return buildTree(locations as any);
  }

  async getAvailable(warehouseId: string): Promise<StorageLocation[]> {
    return this.repository.find({
      where: {
        warehouseId,
        status: StorageLocationStatus.EMPTY,
        level: 3, // Only compartments
      },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<StorageLocation> {
    const location = await this.repository.findOne({
      where: { id },
      relations: ['warehouse', 'parent', 'children'],
    });

    if (!location) {
      throw new NotFoundException('Không tìm thấy vị trí lưu trữ');
    }

    return location;
  }

  async getStatus(id: string) {
    const location = await this.findById(id);

    return {
      id: location.id,
      name: location.name,
      status: location.status,
      capacity: location.capacity,
      currentUsage: location.currentUsage,
      usagePercent: location.capacity
        ? Math.round((location.currentUsage / location.capacity) * 100)
        : 0,
    };
  }

  async create(dto: CreateStorageLocationDto): Promise<StorageLocation> {
    // Check duplicate code in same warehouse
    const existingCode = await this.repository.findOne({
      where: { code: dto.code, warehouseId: dto.warehouseId },
    });
    if (existingCode) {
      throw new BadRequestException('Mã vị trí đã tồn tại trong kho này');
    }

    // Validate hierarchy rules
    if (dto.type === StorageLocationType.CABINET) {
      // CABINET (Tủ) should not have a parent
      if (dto.parentId) {
        throw new BadRequestException('Tủ không thể có vị trí cha');
      }
    } else if (dto.type === StorageLocationType.SHELF) {
      // SHELF (Kệ) must have a CABINET parent
      if (!dto.parentId) {
        throw new BadRequestException('Kệ phải thuộc về một Tủ');
      }
      const parent = await this.findById(dto.parentId);
      if (parent.type !== StorageLocationType.CABINET) {
        throw new BadRequestException('Kệ chỉ có thể thuộc về Tủ');
      }
    } else if (dto.type === StorageLocationType.COMPARTMENT) {
      // COMPARTMENT (Ngăn) must have a SHELF parent
      if (!dto.parentId) {
        throw new BadRequestException('Ngăn phải thuộc về một Kệ');
      }
      const parent = await this.findById(dto.parentId);
      if (parent.type !== StorageLocationType.SHELF) {
        throw new BadRequestException('Ngăn chỉ có thể thuộc về Kệ');
      }
    }

    let parentPath: string = null;
    let level = 1;

    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      parentPath = parent.path;
      level = parent.level + 1;
    }

    const location = this.repository.create({
      ...dto,
      level,
    });

    const saved = await this.repository.save(location);

    saved.path = generatePath(parentPath, saved.id);
    await this.repository.save(saved);

    return saved;
  }

  async update(id: string, dto: UpdateStorageLocationDto): Promise<StorageLocation> {
    const location = await this.findById(id);

    // Check duplicate code if code is being changed
    if (dto.code && dto.code !== location.code) {
      const existingCode = await this.repository.findOne({
        where: { code: dto.code, warehouseId: location.warehouseId },
      });
      if (existingCode) {
        throw new BadRequestException('Mã vị trí đã tồn tại trong kho này');
      }
    }

    Object.assign(location, dto);
    return this.repository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findById(id);

    // Check if has children
    const children = await this.repository.find({ where: { parentId: id } });
    if (children.length > 0) {
      throw new BadRequestException('Không thể xóa vị trí đang có vị trí con');
    }

    // Check if in use (has stored samples)
    if (location.currentUsage > 0) {
      throw new BadRequestException('Không thể xóa vị trí đang chứa mẫu');
    }

    await this.repository.remove(location);
  }
}
