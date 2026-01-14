import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WarehouseReceipt } from './entities/warehouse-receipt.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateCode } from '../../../common/utils/code-generator.util';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(WarehouseReceipt)
    private readonly repository: Repository<WarehouseReceipt>,
  ) {}

  async findAll(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.warehouse', 'warehouse')
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
      relations: ['warehouse', 'items', 'items.sample'],
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

    return generateCode('PN', lastReceipt?.receiptNumber);
  }

  async create(dto: any, userId: string): Promise<WarehouseReceipt> {
    const receiptNumber = await this.generateCode();

    const receipt = this.repository.create({
      receiptNumber,
      warehouseId: dto.warehouseId,
      receiptDate: dto.receiptDate,
      notes: dto.notes,
      createdBy: userId,
    });

    return this.repository.save(receipt);
  }

  async update(id: string, dto: any): Promise<WarehouseReceipt> {
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
