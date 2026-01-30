import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseExport } from './entities/warehouse-export.entity';
import { WarehouseExportItem } from './entities/warehouse-export-item.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { InventoryTransaction, TransactionType, ReferenceType } from '../inventory/entities/inventory-transaction.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';
import { ExportStatus, canTransition } from '../../../shared/constants/export-status.constant';

@Injectable()
export class ExportsService {
  constructor(
    @InjectRepository(WarehouseExport)
    private readonly repository: Repository<WarehouseExport>,
    @InjectRepository(WarehouseExportItem)
    private readonly itemRepository: Repository<WarehouseExportItem>,
    @InjectRepository(Sample)
    private readonly sampleRepo: Repository<Sample>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepo: Repository<InventoryTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  // Chuẩn hóa đơn vị: 'g' -> 'gram', 'hạt' -> 'hat'
  private normalizeUnit(unit: string): string {
    if (!unit) return 'gram';
    const lower = unit.toLowerCase().trim();
    if (lower === 'g' || lower === 'gram') return 'gram';
    if (lower === 'kg' || lower === 'kilogram') return 'kg';
    if (lower === 'hat' || lower === 'hạt') return 'hat';
    return lower;
  }

  // Hiển thị tên đơn vị
  private unitLabel(unit: string): string {
    const normalized = this.normalizeUnit(unit);
    if (normalized === 'gram') return 'gram';
    if (normalized === 'kg') return 'kg';
    if (normalized === 'hat') return 'hạt';
    return unit;
  }

  // Validate đơn vị của item phải khớp với đơn vị thu thập của mẫu
  private async validateItemUnits(items: Array<{ sampleId: string; unit?: string }>): Promise<void> {
    for (const itemDto of items) {
      const sample = await this.sampleRepo.findOne({ where: { id: itemDto.sampleId } });
      if (!sample) {
        throw new BadRequestException(`Không tìm thấy mẫu với ID: ${itemDto.sampleId}`);
      }

      const itemUnit = this.normalizeUnit(itemDto.unit || 'gram');
      const sampleUnit = this.normalizeUnit(sample.quantityUnit || 'gram');

      if (itemUnit !== sampleUnit) {
        throw new BadRequestException(
          `Mẫu "${sample.code}" có đơn vị thu thập là "${this.unitLabel(sampleUnit)}". ` +
          `Đơn vị xuất kho phải cùng đơn vị "${this.unitLabel(sampleUnit)}", ` +
          `không thể dùng "${this.unitLabel(itemUnit)}".`,
        );
      }
    }
  }

  // Validate tồn kho: SL xuất không được vượt quá tồn kho khả dụng trong kho
  private async validateStockAvailability(
    warehouseId: string,
    items: Array<{ sampleId: string; quantity: number }>,
  ): Promise<void> {
    for (const item of items) {
      const result = await this.transactionRepo
        .createQueryBuilder('tx')
        .select(
          `SUM(CASE WHEN tx.transactionType IN ('IMPORT', 'TRANSFER_IN') THEN tx.quantity ELSE 0 END)`,
          'totalIn',
        )
        .addSelect(
          `SUM(CASE WHEN tx.transactionType IN ('EXPORT', 'TRANSFER_OUT') THEN ABS(tx.quantity) ELSE 0 END)`,
          'totalOut',
        )
        .where('tx.warehouseId = :warehouseId', { warehouseId })
        .andWhere('tx.sampleId = :sampleId', { sampleId: item.sampleId })
        .getRawOne();

      const totalIn = Number(result?.totalIn) || 0;
      const totalOut = Number(result?.totalOut) || 0;
      const available = totalIn - totalOut;

      if (Number(item.quantity) > available) {
        const sample = await this.sampleRepo.findOne({ where: { id: item.sampleId } });
        const sampleUnit = this.normalizeUnit(sample?.quantityUnit || 'gram');
        throw new BadRequestException(
          `Mẫu "${sample?.code}" tồn kho khả dụng ${available} ${this.unitLabel(sampleUnit)}, ` +
          `không thể xuất ${item.quantity}.`,
        );
      }
    }
  }

  async findAll(query: PaginationDto & { status?: ExportStatus }) {
    const { page, limit, sortBy, sortOrder, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('exp')
      .leftJoinAndSelect('exp.warehouse', 'warehouse')
      .leftJoinAndSelect('exp.creator', 'creator')
      .leftJoinAndSelect('exp.submitter', 'submitter')
      .leftJoinAndSelect('exp.approver', 'approver')
      .leftJoinAndSelect('exp.items', 'items');

    if (search) {
      queryBuilder.andWhere('exp.exportNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('exp.status = :status', { status });
    }

    queryBuilder
      .orderBy(`exp.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<WarehouseExport> {
    const exportRecord = await this.repository.findOne({
      where: { id },
      relations: ['warehouse', 'creator', 'submitter', 'approver', 'items', 'items.sample'],
    });

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }

    return exportRecord;
  }

  async generateCode(): Promise<string> {
    const lastExport = await this.repository
      .createQueryBuilder('exp')
      .orderBy('exp.createdAt', 'DESC')
      .getOne();

    return generateCode('PX', lastExport?.exportNumber);
  }

  async create(dto: any, userId: string): Promise<WarehouseExport> {
    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exportNumber = await this.generateCode();

      const exportRecord = this.repository.create({
        exportNumber,
        warehouseId: dto.warehouseId,
        exportDate: dto.exportDate || new Date(),
        reasonId: dto.reasonId,
        recipientName: dto.recipientName,
        recipientAddress: dto.recipientAddress,
        recipientContact: dto.recipientContact,
        notes: dto.notes,
        status: ExportStatus.DRAFT,
        createdBy: userId,
        totalItems: dto.items?.length || 0,
      });

      const savedExport = await queryRunner.manager.save(exportRecord);

      // Create items
      if (dto.items && dto.items.length > 0) {
        for (const itemDto of dto.items) {
          const item = this.itemRepository.create({
            exportId: savedExport.id,
            sampleId: itemDto.sampleId,
            locationId: itemDto.locationId || null,
            quantity: itemDto.quantity,
            unit: this.normalizeUnit(itemDto.unit || 'gram'),
            notes: itemDto.notes,
          });
          await queryRunner.manager.save(item);
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(savedExport.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: any): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (exportRecord.status !== ExportStatus.DRAFT) {
      throw new BadRequestException('Can only update draft exports');
    }

    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update header fields
      exportRecord.warehouseId = dto.warehouseId ?? exportRecord.warehouseId;
      exportRecord.exportDate = dto.exportDate ?? exportRecord.exportDate;
      exportRecord.reasonId = dto.reasonId ?? exportRecord.reasonId;
      exportRecord.recipientName = dto.recipientName ?? exportRecord.recipientName;
      exportRecord.recipientAddress = dto.recipientAddress ?? exportRecord.recipientAddress;
      exportRecord.recipientContact = dto.recipientContact ?? exportRecord.recipientContact;
      exportRecord.notes = dto.notes ?? exportRecord.notes;

      if (dto.items) {
        // Delete old items
        await queryRunner.manager.delete(WarehouseExportItem, { exportId: id });

        // Create new items
        for (const itemDto of dto.items) {
          const item = this.itemRepository.create({
            exportId: id,
            sampleId: itemDto.sampleId,
            locationId: itemDto.locationId || null,
            quantity: itemDto.quantity,
            unit: this.normalizeUnit(itemDto.unit || 'gram'),
            notes: itemDto.notes,
          });
          await queryRunner.manager.save(item);
        }

        exportRecord.totalItems = dto.items.length;
      }

      // Clear items to prevent cascade issues
      delete (exportRecord as any).items;
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

  async submitForApproval(id: string, userId: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.PENDING_APPROVAL)) {
      throw new BadRequestException('Cannot submit for approval from current status');
    }

    if (!exportRecord.items || exportRecord.items.length === 0) {
      throw new BadRequestException('Phiếu xuất phải có ít nhất 1 mẫu');
    }

    // Validate tồn kho trước khi gửi duyệt
    await this.validateStockAvailability(exportRecord.warehouseId, exportRecord.items);

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

    // Validate tồn kho lần cuối trước khi duyệt (phòng trường hợp tồn kho thay đổi)
    if (exportRecord.items && exportRecord.items.length > 0) {
      await this.validateStockAvailability(exportRecord.warehouseId, exportRecord.items);
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

  async exported(id: string, userId: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.EXPORTED)) {
      throw new BadRequestException('Không thể xuất kho từ trạng thái hiện tại');
    }

    if (!exportRecord.items || exportRecord.items.length === 0) {
      throw new BadRequestException('Phiếu xuất không có mẫu nào');
    }

    // Validate tồn kho lần cuối trước khi xuất thực tế
    await this.validateStockAvailability(exportRecord.warehouseId, exportRecord.items);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of exportRecord.items) {
        const sample = item.sample || await this.sampleRepo.findOne({ where: { id: item.sampleId } });
        const unit = this.normalizeUnit(item.unit || sample?.quantityUnit || 'gram');

        // Tạo EXPORT InventoryTransaction (giống receipts tạo IMPORT khi confirm)
        const transaction = this.transactionRepo.create({
          sampleId: item.sampleId,
          warehouseId: exportRecord.warehouseId,
          locationId: item.locationId || null,
          transactionType: TransactionType.EXPORT,
          quantity: -Number(item.quantity), // Âm: xuất kho
          unit,
          referenceType: ReferenceType.EXPORT,
          referenceId: exportRecord.id,
          referenceNumber: exportRecord.exportNumber,
          transactionDate: exportRecord.exportDate || new Date(),
          notes: `Xuất kho từ phiếu ${exportRecord.exportNumber}`,
          createdBy: userId,
        });
        await queryRunner.manager.save(transaction);

        // Trừ currentQuantity trên Sample
        await queryRunner.manager.decrement(
          Sample,
          { id: item.sampleId },
          'currentQuantity',
          Number(item.quantity),
        );
      }

      exportRecord.status = ExportStatus.EXPORTED;
      delete (exportRecord as any).items;
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

  async cancel(id: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.CANCELLED)) {
      throw new BadRequestException('Không thể hủy phiếu từ trạng thái hiện tại');
    }
    exportRecord.status = ExportStatus.CANCELLED;
    return this.repository.save(exportRecord);
  }

  async resubmit(id: string): Promise<WarehouseExport> {
    const exportRecord = await this.findById(id);
    if (!canTransition(exportRecord.status, ExportStatus.DRAFT)) {
      throw new BadRequestException('Không thể chuyển về nháp từ trạng thái hiện tại');
    }
    exportRecord.status = ExportStatus.DRAFT;
    exportRecord.rejectionReason = null;
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
