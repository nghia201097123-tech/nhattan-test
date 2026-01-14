import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseExport } from './entities/warehouse-export.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';
import { ExportStatus, canTransition } from '../../../shared/constants/export-status.constant';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(WarehouseExport)
    private readonly repository: Repository<WarehouseExport>,
  ) {}

  async findAll(query: PaginationDto & { status?: ExportStatus }) {
    const { page, limit, sortBy, sortOrder, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('export')
      .leftJoinAndSelect('export.warehouse', 'warehouse')
      .leftJoinAndSelect('export.items', 'items');

    if (search) {
      queryBuilder.andWhere('export.exportNumber ILIKE :search', {
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
      relations: ['warehouse', 'approver', 'items', 'items.sample'],
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

    return generateCode('PX', lastExport?.exportNumber);
  }

  async create(dto: any, userId: string): Promise<WarehouseExport> {
    const exportNumber = await this.generateCode();

    const exportRecord = this.repository.create({
      exportNumber,
      warehouseId: dto.warehouseId,
      exportDate: dto.exportDate || new Date(),
      recipientName: dto.recipientName,
      recipientAddress: dto.recipientAddress,
      notes: dto.notes,
      status: ExportStatus.DRAFT,
      createdBy: userId,
    });

    return this.repository.save(exportRecord);
  }

  async update(id: string, dto: any): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (exportRecord.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Can only update draft exports');
    }
    Object.assign(exportRecord, dto);
    return this.repository.save(exportRecord);
  }

  async submitForApproval(id: string, userId: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.PENDING_APPROVAL)) {
      throw new BadRequestException('Cannot submit for approval from current status');
    }
    exportRecord.status = ExportStatus.PENDING_APPROVAL;
    exportRecord.submittedAt = new Date();
    exportRecord.submittedBy = userId;
    return this.repository.save(exportRecord);
  }

  async approve(id: string, userId: string, notes?: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.APPROVED)) {
      throw new BadRequestException('Cannot approve from current status');
    }
    exportRecord.status = ExportStatus.APPROVED;
    exportRecord.approvedBy = userId;
    exportRecord.approvedAt = new Date();
    if (notes) exportRecord.notes = notes;
    return this.repository.save(exportRecord);
  }

  async reject(id: string, userId: string, reason?: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.REJECTED)) {
      throw new BadRequestException('Cannot reject from current status');
    }
    exportRecord.status = ExportStatus.REJECTED;
    exportRecord.approvedBy = userId;
    exportRecord.approvedAt = new Date();
    exportRecord.rejectionReason = reason;
    return this.repository.save(exportRecord);
  }

  async remove(id: string): Promise<void> {
    const exportRecord = await this.findById(id);
    if (exportRecord.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft exports');
    }
    await this.repository.remove(exportRecord);
  }
}
