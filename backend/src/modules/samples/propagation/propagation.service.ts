import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropagationBatch, PropagationStatus } from './entities/propagation-batch.entity';
import { CreatePropagationDto, UpdateProgressDto, HarvestResultDto } from './dto/create-propagation.dto';
import { UpdatePropagationDto } from './dto/update-propagation.dto';
import { PropagationFilterDto } from './dto/propagation-filter.dto';

@Injectable()
export class PropagationService {
  constructor(
    @InjectRepository(PropagationBatch)
    private readonly repository: Repository<PropagationBatch>,
  ) {}

  async findAll(query: PropagationFilterDto) {
    const {
      search,
      sampleId,
      propagatorId,
      status,
      startDateFrom,
      startDateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.repository
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.sample', 'sample')
      .leftJoinAndSelect('sample.variety', 'variety')
      .leftJoinAndSelect('sample.category', 'category')
      .leftJoinAndSelect('batch.propagator', 'propagator')
      .leftJoinAndSelect('batch.resultWarehouse', 'resultWarehouse')
      .leftJoinAndSelect('batch.resultLocation', 'resultLocation')
      .leftJoinAndSelect('batch.creator', 'creator');

    if (search) {
      queryBuilder.andWhere(
        '(batch.code ILIKE :search OR batch.name ILIKE :search OR sample.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sampleId) {
      queryBuilder.andWhere('batch.sampleId = :sampleId', { sampleId });
    }

    if (propagatorId) {
      queryBuilder.andWhere('batch.propagatorId = :propagatorId', { propagatorId });
    }

    if (status) {
      queryBuilder.andWhere('batch.status = :status', { status });
    }

    if (startDateFrom) {
      queryBuilder.andWhere('batch.startDate >= :startDateFrom', { startDateFrom });
    }

    if (startDateTo) {
      queryBuilder.andWhere('batch.startDate <= :startDateTo', { startDateTo });
    }

    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy(`batch.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const batch = await this.repository.findOne({
      where: { id },
      relations: [
        'sample',
        'sample.variety',
        'sample.category',
        'propagator',
        'resultWarehouse',
        'resultLocation',
        'creator',
        'updater',
      ],
    });

    if (!batch) {
      throw new NotFoundException(`Propagation batch with ID ${id} not found`);
    }

    return batch;
  }

  async findBySampleId(sampleId: string) {
    return this.repository.find({
      where: { sampleId },
      relations: ['propagator', 'resultWarehouse', 'resultLocation'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreatePropagationDto, userId: string) {
    const code = await this.generateCode();

    const batch = this.repository.create({
      ...dto,
      code,
      status: PropagationStatus.PLANNED,
      progress: 0,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.repository.save(batch);
  }

  async update(id: string, dto: UpdatePropagationDto, userId: string) {
    const batch = await this.findById(id);

    Object.assign(batch, dto, { updatedBy: userId });

    return this.repository.save(batch);
  }

  async updateProgress(id: string, dto: UpdateProgressDto, userId: string) {
    const batch = await this.findById(id);

    batch.progress = dto.progress;
    if (dto.status) {
      batch.status = dto.status;
    }
    if (dto.notes) {
      batch.notes = dto.notes;
    }
    batch.updatedBy = userId;

    // Auto update status based on progress
    if (dto.progress === 100 && !dto.status) {
      batch.status = PropagationStatus.IN_PROGRESS;
    }

    return this.repository.save(batch);
  }

  async recordHarvest(id: string, dto: HarvestResultDto, userId: string) {
    const batch = await this.findById(id);

    if (batch.status === PropagationStatus.CANCELLED) {
      throw new BadRequestException('Cannot record harvest for cancelled batch');
    }

    batch.harvestDate = new Date(dto.harvestDate);
    batch.harvestQuantity = dto.harvestQuantity;
    batch.harvestUnit = dto.harvestUnit || batch.harvestUnit;
    batch.qualityRating = dto.qualityRating;
    batch.resultWarehouseId = dto.resultWarehouseId;
    batch.resultLocationId = dto.resultLocationId;
    batch.harvestNotes = dto.harvestNotes;
    batch.actualEndDate = new Date(dto.harvestDate);
    batch.status = PropagationStatus.HARVESTED;
    batch.progress = 100;
    batch.updatedBy = userId;

    return this.repository.save(batch);
  }

  async complete(id: string, userId: string) {
    const batch = await this.findById(id);

    if (batch.status !== PropagationStatus.HARVESTED) {
      throw new BadRequestException('Can only complete harvested batches');
    }

    batch.status = PropagationStatus.COMPLETED;
    batch.updatedBy = userId;

    return this.repository.save(batch);
  }

  async cancel(id: string, userId: string) {
    const batch = await this.findById(id);

    if (batch.status === PropagationStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed batch');
    }

    batch.status = PropagationStatus.CANCELLED;
    batch.updatedBy = userId;

    return this.repository.save(batch);
  }

  async remove(id: string) {
    const batch = await this.findById(id);
    return this.repository.softRemove(batch);
  }

  async getStatistics() {
    const stats = await this.repository
      .createQueryBuilder('batch')
      .select('batch.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(batch.harvestQuantity)', 'totalHarvest')
      .groupBy('batch.status')
      .getRawMany();

    return stats;
  }

  private async generateCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `NM${year}`;

    const lastBatch = await this.repository
      .createQueryBuilder('batch')
      .where('batch.code LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('batch.code', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.code.slice(-5), 10);
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }
}
