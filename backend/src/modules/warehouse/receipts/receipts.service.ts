import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseReceipt } from './entities/warehouse-receipt.entity';
import { WarehouseReceiptItem } from './entities/warehouse-receipt-item.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';
import { InventoryTransaction, TransactionType } from '../inventory/entities/inventory-transaction.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { SampleStatus } from '../../../shared/constants/sample-status.constant';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(WarehouseReceipt)
    private readonly repository: Repository<WarehouseReceipt>,
    @InjectRepository(WarehouseReceiptItem)
    private readonly itemRepository: Repository<WarehouseReceiptItem>,
    @InjectRepository(InventoryTransaction)
    private readonly inventoryRepository: Repository<InventoryTransaction>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.warehouse', 'warehouse')
      .leftJoinAndSelect('receipt.receiver', 'receiver')
      .leftJoinAndSelect('receipt.items', 'items');

    if (search) {
      queryBuilder.andWhere('receipt.receiptCode ILIKE :search', {
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
      relations: ['warehouse', 'receiver', 'items', 'items.sample', 'items.storageLocation'],
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async generateCode(): Promise<string> {
    const lastReceipt = await this.repository
      .createQueryBuilder('receipt')
      .orderBy('receipt.createdAt', 'DESC')
      .getOne();

    return generateCode('PN', lastReceipt?.receiptCode);
  }

  async create(dto: CreateReceiptDto, userId: string): Promise<WarehouseReceipt> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const receiptCode = await this.generateCode();

      const receipt = this.repository.create({
        receiptCode,
        warehouseId: dto.warehouseId,
        receiptDate: dto.receiptDate,
        receiverId: dto.receiverId,
        notes: dto.notes,
        createdBy: userId,
      });

      const savedReceipt = await queryRunner.manager.save(receipt);

      // Create receipt items and inventory transactions
      for (const item of dto.items) {
        const receiptItem = this.itemRepository.create({
          receiptId: savedReceipt.id,
          sampleId: item.sampleId,
          quantity: item.quantity,
          storageLocationId: item.storageLocationId,
          notes: item.notes,
        });
        await queryRunner.manager.save(receiptItem);

        // Create inventory transaction (IN)
        const inventoryTx = this.inventoryRepository.create({
          sampleId: item.sampleId,
          warehouseId: dto.warehouseId,
          storageLocationId: item.storageLocationId,
          transactionType: TransactionType.IN,
          quantity: item.quantity,
          referenceType: 'RECEIPT',
          referenceId: savedReceipt.id,
          transactionDate: dto.receiptDate,
          createdBy: userId,
        });
        await queryRunner.manager.save(inventoryTx);

        // Update sample status
        await queryRunner.manager.update(Sample, item.sampleId, {
          status: SampleStatus.IN_STORAGE,
          storageLocationId: item.storageLocationId,
          warehouseId: dto.warehouseId,
        });
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

  async update(id: string, dto: UpdateReceiptDto): Promise<WarehouseReceipt> {
    const receipt = await this.findById(id);
    Object.assign(receipt, dto);
    return this.repository.save(receipt);
  }

  async remove(id: string): Promise<void> {
    const receipt = await this.findById(id);

    if (receipt.items && receipt.items.length > 0) {
      throw new BadRequestException('Cannot delete receipt with items');
    }

    await this.repository.remove(receipt);
  }
}
