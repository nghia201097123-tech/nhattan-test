import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseTransfer, TransferStatus } from './entities/warehouse-transfer.entity';
import { WarehouseTransferItem } from './entities/warehouse-transfer-item.entity';
import { InventoryTransaction, TransactionType, ReferenceType } from '../inventory/entities/inventory-transaction.entity';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferFilterDto } from './dto/transfer-filter.dto';
import { Sample } from '../../samples/collection/entities/sample.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(WarehouseTransfer)
    private transferRepo: Repository<WarehouseTransfer>,
    @InjectRepository(WarehouseTransferItem)
    private itemRepo: Repository<WarehouseTransferItem>,
    @InjectRepository(InventoryTransaction)
    private transactionRepo: Repository<InventoryTransaction>,
    @InjectRepository(Sample)
    private sampleRepo: Repository<Sample>,
    private dataSource: DataSource,
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
          `Đơn vị chuyển kho phải cùng đơn vị "${this.unitLabel(sampleUnit)}", ` +
          `không thể dùng "${this.unitLabel(itemUnit)}".`,
        );
      }
    }
  }

  async generateTransferNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CK${year}`;

    const lastTransfer = await this.transferRepo
      .createQueryBuilder('t')
      .where('t.transferNumber LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('t.transferNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastTransfer) {
      const lastSeq = parseInt(lastTransfer.transferNumber.slice(-6), 10);
      sequence = lastSeq + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  async findAll(query: TransferFilterDto) {
    const { search, fromWarehouseId, toWarehouseId, status, dateFrom, dateTo, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.transferRepo.createQueryBuilder('t')
      .leftJoinAndSelect('t.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('t.toWarehouse', 'toWarehouse')
      .leftJoinAndSelect('t.creator', 'creator')
      .leftJoinAndSelect('t.items', 'items')
      .leftJoinAndSelect('items.sample', 'sample');

    if (search) {
      qb.andWhere('t.transferNumber ILIKE :search', { search: `%${search}%` });
    }

    if (fromWarehouseId) {
      qb.andWhere('t.fromWarehouseId = :fromWarehouseId', { fromWarehouseId });
    }

    if (toWarehouseId) {
      qb.andWhere('t.toWarehouseId = :toWarehouseId', { toWarehouseId });
    }

    if (status) {
      qb.andWhere('t.status = :status', { status });
    }

    if (dateFrom) {
      qb.andWhere('t.transferDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      qb.andWhere('t.transferDate <= :dateTo', { dateTo });
    }

    const total = await qb.getCount();

    qb.orderBy(`t.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const data = await qb.getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: [
        'fromWarehouse',
        'toWarehouse',
        'creator',
        'sender',
        'receiver',
        'items',
        'items.sample',
        'items.fromLocation',
        'items.toLocation',
      ],
    });

    if (!transfer) {
      throw new NotFoundException('Không tìm thấy phiếu chuyển kho');
    }

    return transfer;
  }

  async create(dto: CreateTransferDto, userId: string) {
    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items as Array<{ sampleId: string; unit?: string }>);
    }

    const transferNumber = await this.generateTransferNumber();

    const transfer = this.transferRepo.create({
      transferNumber,
      fromWarehouseId: dto.fromWarehouseId,
      toWarehouseId: dto.toWarehouseId,
      transferDate: new Date(dto.transferDate),
      notes: dto.notes,
      totalItems: dto.items.length,
      status: TransferStatus.DRAFT,
      createdBy: userId,
    });

    const saved = await this.transferRepo.save(transfer);

    // Create items
    const items = dto.items.map((item) =>
      this.itemRepo.create({
        transferId: saved.id,
        sampleId: item.sampleId,
        fromLocationId: item.fromLocationId,
        toLocationId: item.toLocationId,
        quantity: item.quantity,
        unit: this.normalizeUnit(item.unit),
        notes: item.notes,
      }),
    );

    await this.itemRepo.save(items);

    return this.findById(saved.id);
  }

  async update(id: string, dto: UpdateTransferDto) {
    const transfer = await this.findById(id);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể sửa phiếu ở trạng thái nháp');
    }

    // Validate đơn vị phải khớp với mẫu
    if (dto.items && dto.items.length > 0) {
      await this.validateItemUnits(dto.items as Array<{ sampleId: string; unit?: string }>);
    }

    Object.assign(transfer, {
      transferDate: dto.transferDate ? new Date(dto.transferDate) : transfer.transferDate,
      notes: dto.notes ?? transfer.notes,
    });

    if (dto.items) {
      // Delete old items
      await this.itemRepo.delete({ transferId: id });

      // Create new items
      const items = dto.items.map((item) =>
        this.itemRepo.create({
          transferId: id,
          sampleId: item.sampleId,
          fromLocationId: item.fromLocationId,
          toLocationId: item.toLocationId,
          quantity: item.quantity,
          unit: this.normalizeUnit(item.unit),
          notes: item.notes,
        }),
      );

      await this.itemRepo.save(items);
      transfer.totalItems = items.length;
    }

    await this.transferRepo.save(transfer);

    return this.findById(id);
  }

  async delete(id: string) {
    const transfer = await this.findById(id);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Chỉ có thể xóa phiếu ở trạng thái nháp');
    }

    await this.transferRepo.remove(transfer);
    return { message: 'Đã xóa phiếu chuyển kho' };
  }

  async send(id: string, userId: string) {
    const transfer = await this.findById(id);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new BadRequestException('Phiếu không ở trạng thái nháp');
    }

    if (transfer.items.length === 0) {
      throw new BadRequestException('Phiếu chuyển kho phải có ít nhất 1 mẫu');
    }

    // Validate: đơn vị phải khớp + quantity không được vượt tồn kho
    for (const item of transfer.items) {
      // Validate đơn vị phải cùng đơn vị với mẫu thu thập
      const sample = await this.sampleRepo.findOne({ where: { id: item.sampleId } });
      if (sample) {
        const itemUnit = this.normalizeUnit(item.unit || 'gram');
        const sampleUnit = this.normalizeUnit(sample.quantityUnit || 'gram');
        if (itemUnit !== sampleUnit) {
          throw new BadRequestException(
            `Mẫu "${sample.code}" có đơn vị thu thập là "${this.unitLabel(sampleUnit)}". ` +
            `Đơn vị chuyển kho phải cùng đơn vị "${this.unitLabel(sampleUnit)}", ` +
            `không thể dùng "${this.unitLabel(itemUnit)}".`,
          );
        }
      }

      const stockResult = await this.transactionRepo
        .createQueryBuilder('tx')
        .select(
          `SUM(CASE WHEN tx.transactionType IN ('IMPORT', 'TRANSFER_IN') THEN tx.quantity ELSE 0 END)`,
          'totalIn',
        )
        .addSelect(
          `SUM(CASE WHEN tx.transactionType IN ('EXPORT', 'TRANSFER_OUT') THEN ABS(tx.quantity) ELSE 0 END)`,
          'totalOut',
        )
        .where('tx.warehouseId = :warehouseId', { warehouseId: transfer.fromWarehouseId })
        .andWhere('tx.sampleId = :sampleId', { sampleId: item.sampleId })
        .getRawOne();

      const available = (Number(stockResult?.totalIn) || 0) - (Number(stockResult?.totalOut) || 0);
      const sampleName = item.sample?.code || item.sample?.varietyName || item.sampleId;

      if (item.quantity > available) {
        throw new BadRequestException(
          `Mẫu "${sampleName}" chỉ còn tồn kho ${available} nhưng yêu cầu chuyển ${item.quantity}`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer status
      transfer.status = TransferStatus.IN_TRANSIT;
      transfer.sentAt = new Date();
      transfer.sentBy = userId;
      await queryRunner.manager.save(transfer);

      // Create inventory transactions - deduct from source warehouse
      for (const item of transfer.items) {
        const transaction = this.transactionRepo.create({
          sampleId: item.sampleId,
          warehouseId: transfer.fromWarehouseId,
          locationId: item.fromLocationId || null,
          transactionType: TransactionType.TRANSFER_OUT,
          quantity: -item.quantity,
          unit: this.normalizeUnit(item.unit || 'gram'),
          referenceType: ReferenceType.TRANSFER,
          referenceId: transfer.id,
          transactionDate: new Date(),
          notes: `Chuyển kho đến ${transfer.toWarehouse?.name || transfer.toWarehouseId}`,
          createdBy: userId,
        });
        await queryRunner.manager.save(transaction);

        // Update sample current quantity
        await queryRunner.manager.decrement(
          Sample,
          { id: item.sampleId },
          'currentQuantity',
          item.quantity,
        );
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

  async receive(id: string, userId: string) {
    const transfer = await this.findById(id);

    if (transfer.status !== TransferStatus.IN_TRANSIT) {
      throw new BadRequestException('Phiếu không ở trạng thái đang chuyển');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transfer status
      transfer.status = TransferStatus.COMPLETED;
      transfer.receivedAt = new Date();
      transfer.receivedBy = userId;
      await queryRunner.manager.save(transfer);

      // Create inventory transactions - add to destination warehouse
      for (const item of transfer.items) {
        const transaction = this.transactionRepo.create({
          sampleId: item.sampleId,
          warehouseId: transfer.toWarehouseId,
          locationId: item.toLocationId || null,
          transactionType: TransactionType.TRANSFER_IN,
          quantity: item.quantity,
          unit: this.normalizeUnit(item.unit || 'gram'),
          referenceType: ReferenceType.TRANSFER,
          referenceId: transfer.id,
          transactionDate: new Date(),
          notes: `Nhận chuyển kho từ ${transfer.fromWarehouse?.name || transfer.fromWarehouseId}`,
          createdBy: userId,
        });
        await queryRunner.manager.save(transaction);

        // Update sample warehouse and location
        await queryRunner.manager.update(Sample, item.sampleId, {
          currentWarehouseId: transfer.toWarehouseId,
          currentLocationId: item.toLocationId || null,
          currentQuantity: () => `current_quantity + ${item.quantity}`,
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

  async cancel(id: string, userId: string) {
    const transfer = await this.findById(id);

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy phiếu đã hoàn thành');
    }

    if (transfer.status === TransferStatus.IN_TRANSIT) {
      // Rollback inventory
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const item of transfer.items) {
          // Restore source warehouse
          await queryRunner.manager.increment(
            Sample,
            { id: item.sampleId },
            'currentQuantity',
            item.quantity,
          );

          // Create reversal transaction
          const transaction = this.transactionRepo.create({
            sampleId: item.sampleId,
            warehouseId: transfer.fromWarehouseId,
            transactionType: TransactionType.ADJUSTMENT,
            quantity: item.quantity,
            unit: this.normalizeUnit(item.unit || 'gram'),
            referenceType: ReferenceType.TRANSFER_CANCEL,
            referenceId: transfer.id,
            transactionDate: new Date(),
            notes: `Hủy chuyển kho`,
            createdBy: userId,
          });
          await queryRunner.manager.save(transaction);
        }

        transfer.status = TransferStatus.CANCELLED;
        await queryRunner.manager.save(transfer);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      transfer.status = TransferStatus.CANCELLED;
      await this.transferRepo.save(transfer);
    }

    return this.findById(id);
  }
}
