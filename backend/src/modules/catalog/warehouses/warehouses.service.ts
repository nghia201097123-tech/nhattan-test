import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { StorageLocation } from '../storage-locations/entities/storage-location.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repository: Repository<Warehouse>,
    @InjectRepository(StorageLocation)
    private readonly storageLocationRepository: Repository<StorageLocation>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Warehouse> {
    const warehouse = await this.repository.findOne({
      where: { id },
      relations: ['storageLocations'],
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async getUsage(id: string) {
    const warehouse = await this.findById(id);

    return {
      id: warehouse.id,
      name: warehouse.name,
      maxCapacity: warehouse.maxCapacity,
      currentUsage: warehouse.currentUsage,
      usagePercent: warehouse.maxCapacity
        ? Math.round((warehouse.currentUsage / warehouse.maxCapacity) * 100)
        : 0,
    };
  }

  async getLocations(id: string): Promise<StorageLocation[]> {
    return this.storageLocationRepository.find({
      where: { warehouseId: id },
      order: { level: 'ASC', sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateWarehouseDto, userId: string): Promise<Warehouse> {
    const existing = await this.repository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Warehouse code already exists');
    }

    const warehouse = this.repository.create({
      ...dto,
      createdBy: userId,
    });

    return this.repository.save(warehouse);
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findById(id);

    if (dto.code && dto.code !== warehouse.code) {
      const existing = await this.repository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new BadRequestException('Warehouse code already exists');
      }
    }

    Object.assign(warehouse, dto);
    return this.repository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findById(id);

    // Check if has storage locations
    const locations = await this.getLocations(id);
    if (locations.length > 0) {
      throw new BadRequestException('Cannot delete warehouse with storage locations');
    }

    await this.repository.remove(warehouse);
  }
}
