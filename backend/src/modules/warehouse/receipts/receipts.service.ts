import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseReceipt } from './entities/warehouse-receipt.entity';
import { WarehouseReceiptItem } from './entities/warehouse-receipt-item.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(WarehouseReceipt)
    private readonly repository: Repository<WarehouseReceipt>,
    @InjectRepository(WarehouseReceiptItem)
    private readonly itemRepository: Repository<WarehouseReceiptItem>,
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

  async create(dto: any, userId: string): Promise<WarehouseReceipt> {
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
            unit: itemDto.unit || 'g',
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
            unit: itemDto.unit || 'g',
            notes: itemDto.notes,
          });
          await queryRunner.manager.save(item);
        }

        receipt.totalItems = dto.items.length;
      }

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

    // Delete items first
    await this.itemRepository.delete({ receiptId: id });

    // Then delete receipt
    await this.repository.remove(receipt);
  }
}
