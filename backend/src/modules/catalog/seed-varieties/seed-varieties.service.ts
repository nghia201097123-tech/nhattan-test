import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeedVariety } from './entities/seed-variety.entity';
import { CreateSeedVarietyDto } from './dto/create-seed-variety.dto';
import { UpdateSeedVarietyDto } from './dto/update-seed-variety.dto';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class SeedVarietiesService {
  constructor(
    @InjectRepository(SeedVariety)
    private readonly repository: Repository<SeedVariety>,
  ) {}

  async findAll(query: PaginationDto, categoryId?: string) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('variety')
      .leftJoinAndSelect('variety.category', 'category');

    if (categoryId) {
      queryBuilder.andWhere('variety.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(variety.name ILIKE :search OR variety.code ILIKE :search OR variety.localName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy(`variety.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<SeedVariety> {
    const variety = await this.repository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!variety) {
      throw new NotFoundException('Seed variety not found');
    }

    return variety;
  }

  async create(dto: CreateSeedVarietyDto, userId: string): Promise<SeedVariety> {
    const existing = await this.repository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException('Variety code already exists');
    }

    const variety = this.repository.create({
      ...dto,
      createdBy: userId,
    });

    return this.repository.save(variety);
  }

  async update(id: string, dto: UpdateSeedVarietyDto, userId: string): Promise<SeedVariety> {
    const variety = await this.findById(id);

    if (dto.code && dto.code !== variety.code) {
      const existing = await this.repository.findOne({ where: { code: dto.code } });
      if (existing) {
        throw new BadRequestException('Variety code already exists');
      }
    }

    // Handle categoryId change - also update the relation
    if (dto.categoryId && dto.categoryId !== variety.categoryId) {
      variety.categoryId = dto.categoryId;
      variety.category = { id: dto.categoryId } as any; // Set relation to trigger proper update
    }

    // Update other fields
    if (dto.name !== undefined) variety.name = dto.name;
    if (dto.scientificName !== undefined) variety.scientificName = dto.scientificName;
    if (dto.localName !== undefined) variety.localName = dto.localName;
    if (dto.origin !== undefined) variety.origin = dto.origin;
    if (dto.characteristics !== undefined) variety.characteristics = dto.characteristics;
    if (dto.growthDuration !== undefined) variety.growthDuration = dto.growthDuration;
    if (dto.yieldPotential !== undefined) variety.yieldPotential = dto.yieldPotential;
    if (dto.diseaseResistance !== undefined) variety.diseaseResistance = dto.diseaseResistance;
    if (dto.notes !== undefined) variety.notes = dto.notes;
    if (dto.isActive !== undefined) variety.isActive = dto.isActive;
    variety.updatedBy = userId;

    return this.repository.save(variety);
  }

  async remove(id: string): Promise<void> {
    const variety = await this.findById(id);
    await this.repository.remove(variety);
  }
}
