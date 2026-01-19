import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocation, StorageLocationStatus, StorageLocationType } from './entities/storage-location.entity';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';
import { buildTree, generatePath } from '../../../common/utils/tree.util';
import { Warehouse } from '../warehouses/entities/warehouse.entity';

@Injectable()
export class StorageLocationsService {
  constructor(
    @InjectRepository(StorageLocation)
    private readonly repository: Repository<StorageLocation>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
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

  // Helper: Calculate total capacity of children
  private async getChildrenTotalCapacity(parentId: string, excludeId?: string): Promise<number> {
    const children = await this.repository.find({ where: { parentId } });
    return children
      .filter(child => child.id !== excludeId)
      .reduce((sum, child) => sum + (child.capacity || 0), 0);
  }

  // Helper: Validate capacity against parent
  private async validateCapacityAgainstParent(
    parentId: string,
    newCapacity: number,
    excludeChildId?: string,
  ): Promise<void> {
    const parent = await this.findById(parentId);
    if (!parent.capacity) return; // Parent has no capacity limit

    const existingChildrenCapacity = await this.getChildrenTotalCapacity(parentId, excludeChildId);
    const totalAfterAdd = existingChildrenCapacity + newCapacity;

    if (totalAfterAdd > parent.capacity) {
      const remaining = parent.capacity - existingChildrenCapacity;
      throw new BadRequestException(
        `Sức chứa vượt quá giới hạn của ${parent.type === StorageLocationType.CABINET ? 'Tủ' : 'Kệ'} cha. ` +
        `Sức chứa còn lại: ${remaining}, yêu cầu: ${newCapacity}`
      );
    }
  }

  // Helper: Validate parent capacity is not less than children total
  private async validateParentCapacityNotLessThanChildren(
    locationId: string,
    newCapacity: number,
  ): Promise<void> {
    const childrenTotal = await this.getChildrenTotalCapacity(locationId);
    if (newCapacity < childrenTotal) {
      throw new BadRequestException(
        `Sức chứa không thể nhỏ hơn tổng sức chứa các vị trí con (${childrenTotal})`
      );
    }
  }

  // Helper: Get total capacity of all cabinets in a warehouse
  private async getCabinetsTotalCapacity(warehouseId: string, excludeId?: string): Promise<number> {
    const cabinets = await this.repository.find({
      where: { warehouseId, type: StorageLocationType.CABINET },
    });
    return cabinets
      .filter(cabinet => cabinet.id !== excludeId)
      .reduce((sum, cabinet) => sum + (cabinet.capacity || 0), 0);
  }

  // Helper: Validate cabinet capacity against warehouse capacity
  private async validateCabinetCapacityAgainstWarehouse(
    warehouseId: string,
    newCapacity: number,
    excludeCabinetId?: string,
  ): Promise<void> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id: warehouseId } });
    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy kho');
    }
    if (!warehouse.maxCapacity) return; // Warehouse has no capacity limit

    const existingCabinetsCapacity = await this.getCabinetsTotalCapacity(warehouseId, excludeCabinetId);
    const totalAfterAdd = existingCabinetsCapacity + newCapacity;

    if (totalAfterAdd > warehouse.maxCapacity) {
      const remaining = warehouse.maxCapacity - existingCabinetsCapacity;
      throw new BadRequestException(
        `Sức chứa vượt quá giới hạn của Kho (${warehouse.maxCapacity}). ` +
        `Sức chứa còn lại: ${remaining}, yêu cầu: ${newCapacity}`
      );
    }
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
      // Validate cabinet capacity against warehouse capacity
      if (dto.capacity) {
        await this.validateCabinetCapacityAgainstWarehouse(dto.warehouseId, dto.capacity);
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

    // Validate capacity against parent
    if (dto.parentId && dto.capacity) {
      await this.validateCapacityAgainstParent(dto.parentId, dto.capacity);
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
    console.log('Update DTO received:', JSON.stringify(dto, null, 2));
    const location = await this.findById(id);
    console.log('Current location:', { id: location.id, parentId: location.parentId, type: location.type });
    const currentType = location.type;
    const newType = dto.type || currentType;
    const newParentId = dto.parentId !== undefined ? dto.parentId : location.parentId;
    console.log('New parentId will be:', newParentId);

    // Check duplicate code if code is being changed
    if (dto.code && dto.code !== location.code) {
      const existingCode = await this.repository.findOne({
        where: { code: dto.code, warehouseId: location.warehouseId },
      });
      if (existingCode) {
        throw new BadRequestException('Mã vị trí đã tồn tại trong kho này');
      }
    }

    // Validate hierarchy rules if type or parentId changes
    if (dto.type !== undefined || dto.parentId !== undefined) {
      if (newType === StorageLocationType.CABINET) {
        if (newParentId) {
          throw new BadRequestException('Tủ không thể có vị trí cha');
        }
      } else if (newType === StorageLocationType.SHELF) {
        if (!newParentId) {
          throw new BadRequestException('Kệ phải thuộc về một Tủ');
        }
        const parent = await this.findById(newParentId);
        if (parent.type !== StorageLocationType.CABINET) {
          throw new BadRequestException('Kệ chỉ có thể thuộc về Tủ');
        }
      } else if (newType === StorageLocationType.COMPARTMENT) {
        if (!newParentId) {
          throw new BadRequestException('Ngăn phải thuộc về một Kệ');
        }
        const parent = await this.findById(newParentId);
        if (parent.type !== StorageLocationType.SHELF) {
          throw new BadRequestException('Ngăn chỉ có thể thuộc về Kệ');
        }
      }
    }

    // Validate cabinet capacity against warehouse
    if (newType === StorageLocationType.CABINET) {
      const capacityToValidate = dto.capacity !== undefined ? dto.capacity : location.capacity;
      if (capacityToValidate) {
        await this.validateCabinetCapacityAgainstWarehouse(location.warehouseId, capacityToValidate, id);
      }
    }

    // Validate capacity changes
    const newCapacity = dto.capacity !== undefined ? dto.capacity : location.capacity;
    if (dto.capacity !== undefined && dto.capacity !== location.capacity) {
      // If this location has children, new capacity must be >= children total
      if (newType !== StorageLocationType.COMPARTMENT) {
        await this.validateParentCapacityNotLessThanChildren(id, dto.capacity);
      }
    }

    // Validate capacity against parent (use new parentId if changed)
    if (newParentId && newCapacity) {
      const excludeId = newParentId === location.parentId ? id : undefined;
      await this.validateCapacityAgainstParent(newParentId, newCapacity, excludeId);
    }

    // Update level and path if parentId changes
    let needUpdatePath = false;
    if (dto.parentId !== undefined && dto.parentId !== location.parentId) {
      needUpdatePath = true;
      // IMPORTANT: Clear the parent relation so TypeORM uses parentId column
      (location as any).parent = null;

      if (dto.parentId) {
        const parent = await this.findById(dto.parentId);
        location.level = parent.level + 1;
        location.path = generatePath(parent.path, location.id);
      } else {
        location.level = 1;
        location.path = generatePath(null, location.id);
      }
    }

    // Clear relations to avoid TypeORM overriding foreign keys
    (location as any).parent = undefined;
    (location as any).children = undefined;
    (location as any).warehouse = undefined;

    Object.assign(location, dto);
    console.log('Location before save:', { id: location.id, parentId: location.parentId, level: location.level });
    const saved = await this.repository.save(location);
    console.log('Location after save:', { id: saved.id, parentId: saved.parentId, level: saved.level });

    // If parent changed, also need to update children's paths recursively
    if (needUpdatePath) {
      await this.updateChildrenPaths(saved);
    }

    return saved;
  }

  // Helper: Recursively update children paths when parent path changes
  private async updateChildrenPaths(parent: StorageLocation): Promise<void> {
    const children = await this.repository.find({ where: { parentId: parent.id } });
    for (const child of children) {
      child.level = parent.level + 1;
      child.path = generatePath(parent.path, child.id);
      await this.repository.save(child);
      await this.updateChildrenPaths(child);
    }
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
