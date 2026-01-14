import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseExport, ExportStatus } from './entities/warehouse-export.entity';
import { WarehouseExportItem } from './entities/warehouse-export-item.entity';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';
import { canTransition } from '../../../shared/constants/export-status.constant';
import { InventoryTransaction, TransactionType } from '../inventory/entities/inventory-transaction.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { SampleStatus } from '../../../shared/constants/sample-status.constant';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(WarehouseExport)
    private readonly repository: Repository<WarehouseExport>,
    @InjectRepository(WarehouseExportItem)
    private readonly itemRepository: Repository<WarehouseExportItem>,
    @InjectRepository(InventoryTransaction)
    private readonly inventoryRepository: Repository<InventoryTransaction>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationDto & { status?: ExportStatus }) {
    const { page, limit, sortBy, sortOrder, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('export')
      .leftJoinAndSelect('export.warehouse', 'warehouse')
      .leftJoinAndSelect('export.requester', 'requester')
      .leftJoinAndSelect('export.items', 'items');

    if (search) {
      queryBuilder.andWhere('export.exportCode ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('export.status = :status', { status });
    }

    queryBuilder
      .orderBy(`export.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<WarehouseExport> {
    const exportRecord = await this.repository.findOne({
      where: { id },
      relations: ['warehouse', 'requester', 'approver', 'items', 'items.sample'],
    });

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }

    return exportRecord;
  }

  async generateCode(): Promise<string> {
    const lastExport = await this.repository
      .createQueryBuilder('export')
      .orderBy('export.createdAt', 'DESC')
      .getOne();

    return generateCode('PX', lastExport?.exportCode);
  }

  async create(dto: CreateExportDto, userId: string): Promise<WarehouseExport> {
    const exportCode = await this.generateCode();

    const exportRecord = this.repository.create({
      exportCode,
      warehouseId: dto.warehouseId,
      purpose: dto.purpose,
      requestDate: dto.requestDate || new Date().toISOString(),
      requesterId: dto.requesterId,
      recipientName: dto.recipientName,
      recipientOrg: dto.recipientOrg,
      recipientPhone: dto.recipientPhone,
      recipientAddress: dto.recipientAddress,
      reason: dto.reason,
      notes: dto.notes,
      status: ExportStatus.DRAFT,
      createdBy: userId,
    });

    const savedExport = await this.repository.save(exportRecord);

    // Create export items
    for (const item of dto.items) {
      const exportItem = this.itemRepository.create({
        exportId: savedExport.id,
        sampleId: item.sampleId,
        quantity: item.quantity,
        notes: item.notes,
      });
      await this.itemRepository.save(exportItem);
    }

    return this.findById(savedExport.id);
  }

  async update(id: string, dto: UpdateExportDto): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);

    if (exportRecord.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Can only update draft exports');
    }

    Object.assign(exportRecord, dto);
    return this.repository.save(exportRecord);
  }

  async submitForApproval(id: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);

    if (!canTransition(exportRecord.status, ExportStatus.PENDING_APPROVAL)) {
      throw new BadRequestException('Cannot submit for approval from current status');
    }

    exportRecord.status = ExportStatus.PENDING_APPROVAL;
    return this.repository.save(exportRecord);
  }

  async approve(id: string, userId: string, notes?: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);

    if (!canTransition(exportRecord.status, ExportStatus.APPROVED)) {
      throw new BadRequestException('Cannot approve from current status');
    }

    exportRecord.status = ExportStatus.APPROVED;
    exportRecord.approverId = userId;
    exportRecord.approvalDate = new Date();
    if (notes) {
      exportRecord.notes = notes;
    }

    return this.repository.save(exportRecord);
  }

  async reject(id: string, userId: string, reason?: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);

    if (!canTransition(exportRecord.status, ExportStatus.REJECTED)) {
      throw new BadRequestException('Cannot reject from current status');
    }

    exportRecord.status = ExportStatus.REJECTED;
    exportRecord.approverId = userId;
    exportRecord.approvalDate = new Date();
    exportRecord.rejectReason = reason;

    return this.repository.save(exportRecord);
  }

  async executeExport(id: string, userId: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);

    if (!canTransition(exportRecord.status, ExportStatus.EXPORTED)) {
      throw new BadRequestException('Cannot execute export from current status');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create inventory transactions and update samples
      for (const item of exportRecord.items) {
        // Create inventory transaction (OUT)
        const inventoryTx = this.inventoryRepository.create({
          sampleId: item.sampleId,
          warehouseId: exportRecord.warehouseId,
          transactionType: TransactionType.OUT,
          quantity: item.quantity,
          referenceType: 'EXPORT',
          referenceId: exportRecord.id,
          transactionDate: new Date().toISOString(),
          createdBy: userId,
        });
        await queryRunner.manager.save(inventoryTx);

        // Update sample status
        await queryRunner.manager.update(Sample, item.sampleId, {
          status: SampleStatus.EXPORTED,
        });
      }

      exportRecord.status = ExportStatus.EXPORTED;
      exportRecord.exportDate = new Date();
      await queryRunner.manager.save(exportRecord);

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const exportRecord = await this.findById(id);

    if (exportRecord.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft exports');
    }

    await this.itemRepository.delete({ exportId: id });
    await this.repository.remove(exportRecord);
  }
}
