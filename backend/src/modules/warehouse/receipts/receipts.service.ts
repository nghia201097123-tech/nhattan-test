import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseReceipt, ReceiptStatus } from './entities/warehouse-receipt.entity';
import { WarehouseReceiptItem } from './entities/warehouse-receipt-item.entity';
import { InventoryTransaction, TransactionType, ReferenceType } from '../inventory/entities/inventory-transaction.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(WarehouseReceipt)
    private readonly repository: Repository<WarehouseReceipt>,
    @InjectRepository(WarehouseReceiptItem)
    private readonly itemRepository: Repository<WarehouseReceiptItem>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepo: Repository<InventoryTransaction>,
    @InjectRepository(Sample)
    private readonly sampleRepo: Repository<Sample>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.warehouse', 'warehouse')
      .leftJoinAndSelect('receipt.creator', 'creator')
      .leftJoinAndSelect('receipt.items', 'items');

    if (search) {
      queryBuilder.andWhere('receipt.receiptNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    queryBuilder
      .orderBy(`receipt.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async findById(id: string): Promise<WarehouseReceipt> {
    const receipt = await this.repository.findOne({
      where: { id },
      relations: ['warehouse', 'creator', 'items', 'items.sample', 'items.location'],
    });

    if (!receipt) {
      throw new NotFoundException('Không tìm thấy phiếu nhập');
    }

    return receipt;
  }

  async generateCode(): Promise<string> {
    const lastReceipt = await this.repository
      .createQueryBuilder('receipt')
      .orderBy('receipt.createdAt', 'DESC')
      .getOne();

    return generateCode('PN', lastReceipt?.receiptNumber);
  }

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
          `Đơn vị nhập kho phải cùng đơn vị "${this.unitLabel(sampleUnit)}", ` +
          `không thể dùng "${this.unitLabel(itemUnit)}".`,
        );
      }
    }
  }

  async create(dto: any, userId: string): Promise<WarehouseReceipt> {
    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate code if not provided
      const receiptNumber = dto.receiptNumber || await this.generateCode();

      // Create receipt
      const receipt = this.repository.create({
        receiptNumber,
        warehouseId: dto.warehouseId,
        receiptDate: dto.receiptDate,
        sourceType: dto.sourceType,
        sourceReference: dto.sourceReference,
        notes: dto.notes,
        createdBy: userId,
        totalItems: dto.items?.length || 0,
      });

      const savedReceipt = await queryRunner.manager.save(receipt);

      // Create items
      if (dto.items && dto.items.length > 0) {
        for (const itemDto of dto.items) {
          const item = this.itemRepository.create({
            receiptId: savedReceipt.id,
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
      return this.findById(savedReceipt.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, dto: any): Promise<WarehouseReceipt> {
    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const receipt = await this.findById(id);

      // Update receipt fields
      receipt.warehouseId = dto.warehouseId ?? receipt.warehouseId;
      receipt.receiptDate = dto.receiptDate ?? receipt.receiptDate;
      receipt.sourceType = dto.sourceType ?? receipt.sourceType;
      receipt.sourceReference = dto.sourceReference ?? receipt.sourceReference;
      receipt.notes = dto.notes ?? receipt.notes;

      // If items are provided, delete old items and create new ones
      if (dto.items) {
        // Delete old items
        await queryRunner.manager.delete(WarehouseReceiptItem, { receiptId: id });

        // Create new items
        for (const itemDto of dto.items) {
          const item = this.itemRepository.create({
            receiptId: id,
            sampleId: itemDto.sampleId,
            locationId: itemDto.locationId || null,
            quantity: itemDto.quantity,
            unit: this.normalizeUnit(itemDto.unit || 'gram'),
            notes: itemDto.notes,
          });
          await queryRunner.manager.save(item);
        }

        receipt.totalItems = dto.items.length;
      }

      // Clear items relation to prevent cascade re-save of stale items
      delete (receipt as any).items;
      await queryRunner.manager.save(receipt);
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
    const receipt = await this.findById(id);

    if (receipt.status === ReceiptStatus.CONFIRMED) {
      throw new BadRequestException('Không thể xóa phiếu đã xác nhận');
    }

    // Delete items first
    await this.itemRepository.delete({ receiptId: id });

    // Then delete receipt
    await this.repository.remove(receipt);
  }

  async confirm(id: string, userId: string): Promise<WarehouseReceipt> {
    const receipt = await this.findById(id);

    if (receipt.status === ReceiptStatus.CONFIRMED) {
      throw new BadRequestException('Phiếu nhập đã được xác nhận');
    }

    if (receipt.status === ReceiptStatus.CANCELLED) {
      throw new BadRequestException('Không thể xác nhận phiếu đã hủy');
    }

    if (!receipt.items || receipt.items.length === 0) {
      throw new BadRequestException('Phiếu nhập phải có ít nhất 1 mẫu');
    }

    // Validate: đơn vị phải khớp + tổng nhập kho không được vượt initialQuantity của mẫu
    for (const item of receipt.items) {
      const sample = await this.sampleRepo.findOne({ where: { id: item.sampleId } });
      if (!sample) {
        throw new BadRequestException(`Không tìm thấy mẫu với ID: ${item.sampleId}`);
      }

      // Validate đơn vị phải cùng đơn vị với mẫu thu thập
      const itemUnit = this.normalizeUnit(item.unit || 'gram');
      const sampleUnit = this.normalizeUnit(sample.quantityUnit || 'gram');
      if (itemUnit !== sampleUnit) {
        throw new BadRequestException(
          `Mẫu "${sample.code}" có đơn vị thu thập là "${this.unitLabel(sampleUnit)}". ` +
          `Đơn vị nhập kho phải cùng đơn vị "${this.unitLabel(sampleUnit)}", ` +
          `không thể dùng "${this.unitLabel(itemUnit)}".`,
        );
      }

      if (sample.initialQuantity != null) {
        // Tính tổng đã nhập trước đó (từ các phiếu đã xác nhận)
        const alreadyImported = await this.transactionRepo
          .createQueryBuilder('tx')
          .select('COALESCE(SUM(tx.quantity), 0)', 'total')
          .where('tx.sampleId = :sampleId', { sampleId: item.sampleId })
          .andWhere('tx.transactionType = :type', { type: TransactionType.IMPORT })
          .getRawOne();

        const totalImported = Number(alreadyImported?.total) || 0;
        const remaining = Number(sample.initialQuantity) - totalImported;

        if (Number(item.quantity) > remaining) {
          throw new BadRequestException(
            `Mẫu "${sample.code}" có số lượng thu thập ${sample.initialQuantity} ${this.unitLabel(sampleUnit)}, ` +
            `đã nhập kho ${totalImported}, còn lại ${remaining}. ` +
            `Không thể nhập thêm ${item.quantity}.`,
          );
        }
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update receipt status
      receipt.status = ReceiptStatus.CONFIRMED;
      receipt.confirmedAt = new Date();
      receipt.confirmedBy = userId;
      await queryRunner.manager.save(receipt);

      // Create IMPORT inventory transactions for each item
      for (const item of receipt.items) {
        const transaction = this.transactionRepo.create({
          sampleId: item.sampleId,
          warehouseId: receipt.warehouseId,
          locationId: item.locationId || null,
          transactionType: TransactionType.IMPORT,
          quantity: item.quantity,
          unit: this.normalizeUnit(item.unit || 'gram'),
          referenceType: ReferenceType.RECEIPT,
          referenceId: receipt.id,
          referenceNumber: receipt.receiptNumber,
          transactionDate: receipt.receiptDate || new Date(),
          notes: `Nhập kho từ phiếu ${receipt.receiptNumber}`,
          createdBy: userId,
        });
        await queryRunner.manager.save(transaction);

        // Update sample currentQuantity, currentWarehouseId, currentLocationId
        await queryRunner.manager.update(Sample, item.sampleId, {
          currentWarehouseId: receipt.warehouseId,
          currentLocationId: item.locationId || null,
          currentQuantity: () => `COALESCE(current_quantity, 0) + ${Number(item.quantity)}`,
        });
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
