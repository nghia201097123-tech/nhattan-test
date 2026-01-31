import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sample } from './entities/sample.entity';
import { SampleEvaluation } from '../evaluation/entities/sample-evaluation.entity';
import { PropagationBatch } from '../propagation/entities/propagation-batch.entity';
import { InventoryTransaction } from '../../warehouse/inventory/entities/inventory-transaction.entity';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleFilterDto } from './dto/sample-filter.dto';
import { createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSampleCode } from '../../../common/utils/code-generator.util';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Sample)
    private readonly repository: Repository<Sample>,
    @InjectRepository(SampleEvaluation)
    private readonly evaluationRepository: Repository<SampleEvaluation>,
    @InjectRepository(PropagationBatch)
    private readonly propagationRepo: Repository<PropagationBatch>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepo: Repository<InventoryTransaction>,
  ) {}

  async findAll(query: SampleFilterDto) {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'DESC', categoryId, status, warehouseId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('sample')
      .leftJoinAndSelect('sample.category', 'category')
      .leftJoinAndSelect('sample.variety', 'variety')
      .leftJoinAndSelect('sample.location', 'location')
      .leftJoinAndSelect('sample.currentWarehouse', 'warehouse')
      .where('sample.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(sample.code ILIKE :search OR sample.varietyName ILIKE :search OR sample.localName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('sample.categoryId = :categoryId', { categoryId });
    }

    if (status) {
      queryBuilder.andWhere('sample.status = :status', { status });
    }

    if (warehouseId) {
      queryBuilder.andWhere('sample.currentWarehouseId = :warehouseId', { warehouseId });
    }

    queryBuilder
      .orderBy(`sample.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<Sample> {
    const sample = await this.repository.findOne({
      where: { id },
      relations: [
        'category',
        'variety',
        'location',
        'provider',
        'collector',
        'currentWarehouse',
        'currentLocation',
        'attachments',
      ],
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    return sample;
  }

  async generateCode(): Promise<{ code: string }> {
    const lastSample = await this.repository
      .createQueryBuilder('sample')
      .orderBy('sample.code', 'DESC')
      .getOne();

    return { code: generateSampleCode(lastSample?.code) };
  }

  async getHistory(id: string): Promise<InventoryTransaction[]> {
    return this.transactionRepo.find({
      where: { sampleId: id },
      relations: ['warehouse'],
      order: { transactionDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async getEvaluations(id: string): Promise<SampleEvaluation[]> {
    return this.evaluationRepository.find({
      where: { sampleId: id },
      relations: ['evaluator'],
      order: { evaluationDate: 'DESC' },
    });
  }

  async getFullInfo(id: string) {
    const [sample, transactions, evaluations, propagations] = await Promise.all([
      this.findById(id),
      this.getHistory(id),
      this.getEvaluations(id),
      this.propagationRepo.find({ where: { sampleId: id }, order: { startDate: 'DESC' } }),
    ]);

    // Tính tổng nhập/xuất/chuyển kho
    let totalImported = 0, totalExported = 0, totalTransferIn = 0, totalTransferOut = 0;
    for (const t of transactions) {
      const qty = Math.abs(Number(t.quantity));
      switch (t.transactionType) {
        case 'IMPORT': totalImported += qty; break;
        case 'EXPORT': totalExported += qty; break;
        case 'TRANSFER_IN': totalTransferIn += qty; break;
        case 'TRANSFER_OUT': totalTransferOut += qty; break;
      }
    }

    const initial = Number(sample.initialQuantity || 0);

    return {
      ...sample,
      quantitySummary: {
        initialQuantity: initial,
        totalImported,
        totalExported,
        totalTransferIn,
        totalTransferOut,
        remainingForImport: Math.max(0, initial - totalImported),
        currentStock: totalImported + totalTransferIn - totalExported - totalTransferOut,
        unit: sample.quantityUnit || 'gram',
      },
      warehouseHistory: transactions,
      evaluations,
      propagations,
    };
  }

  async create(dto: CreateSampleDto, userId: string): Promise<Sample> {
    const { code } = await this.generateCode();

    const sample = this.repository.create({
      ...dto,
      code,
      collectionYear: new Date(dto.collectionDate).getFullYear(),
      createdBy: userId,
    });

    return this.repository.save(sample);
  }

  async update(id: string, dto: UpdateSampleDto, userId: string): Promise<Sample> {
    const sample = await this.findById(id);

    Object.assign(sample, dto, { updatedBy: userId });

    if (dto.collectionDate) {
      sample.collectionYear = new Date(dto.collectionDate).getFullYear();
    }

    return this.repository.save(sample);
  }

  async remove(id: string): Promise<void> {
    const sample = await this.findById(id);
    await this.repository.softRemove(sample);
  }
}
