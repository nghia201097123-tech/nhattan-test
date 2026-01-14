import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryTransaction, TransactionType } from './entities/inventory-transaction.entity';
import { PaginationDto, createPaginatedResult } from '../../../common/dto/pagination.dto';

export interface InventoryQueryDto extends PaginationDto {
  warehouseId?: string;
  sampleId?: string;
  transactionType?: TransactionType;
  fromDate?: string;
  toDate?: string;
}

export interface StockSummary {
  sampleId: string;
  sampleCode: string;
  sampleName: string;
  warehouseId: string;
  warehouseName: string;
  totalIn: number;
  totalOut: number;
  currentStock: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private readonly repository: Repository<InventoryTransaction>,
  ) {}

  async findAll(query: InventoryQueryDto) {
    const { page, limit, sortBy, sortOrder, warehouseId, sampleId, transactionType, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.sample', 'sample')
      .leftJoinAndSelect('tx.warehouse', 'warehouse')
      .leftJoinAndSelect('tx.storageLocation', 'storageLocation');

    if (warehouseId) {
      queryBuilder.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    if (sampleId) {
      queryBuilder.andWhere('tx.sampleId = :sampleId', { sampleId });
    }

    if (transactionType) {
      queryBuilder.andWhere('tx.transactionType = :transactionType', { transactionType });
    }

    if (fromDate) {
      queryBuilder.andWhere('tx.transactionDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('tx.transactionDate <= :toDate', { toDate });
    }

    queryBuilder
      .orderBy(`tx.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(data, total, page, limit);
  }

  async getStockBySample(sampleId: string): Promise<StockSummary[]> {
    const result = await this.repository
      .createQueryBuilder('tx')
      .select('tx.sampleId', 'sampleId')
      .addSelect('sample.sampleCode', 'sampleCode')
      .addSelect('sample.sampleName', 'sampleName')
      .addSelect('tx.warehouseId', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(
        `SUM(CASE WHEN tx.transactionType = 'IN' THEN tx.quantity ELSE 0 END)`,
        'totalIn',
      )
      .addSelect(
        `SUM(CASE WHEN tx.transactionType = 'OUT' THEN tx.quantity ELSE 0 END)`,
        'totalOut',
      )
      .leftJoin('tx.sample', 'sample')
      .leftJoin('tx.warehouse', 'warehouse')
      .where('tx.sampleId = :sampleId', { sampleId })
      .groupBy('tx.sampleId')
      .addGroupBy('sample.sampleCode')
      .addGroupBy('sample.sampleName')
      .addGroupBy('tx.warehouseId')
      .addGroupBy('warehouse.name')
      .getRawMany();

    return result.map((r) => ({
      ...r,
      totalIn: Number(r.totalIn),
      totalOut: Number(r.totalOut),
      currentStock: Number(r.totalIn) - Number(r.totalOut),
    }));
  }

  async getStockByWarehouse(warehouseId: string): Promise<StockSummary[]> {
    const result = await this.repository
      .createQueryBuilder('tx')
      .select('tx.sampleId', 'sampleId')
      .addSelect('sample.sampleCode', 'sampleCode')
      .addSelect('sample.sampleName', 'sampleName')
      .addSelect('tx.warehouseId', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(
        `SUM(CASE WHEN tx.transactionType = 'IN' THEN tx.quantity ELSE 0 END)`,
        'totalIn',
      )
      .addSelect(
        `SUM(CASE WHEN tx.transactionType = 'OUT' THEN tx.quantity ELSE 0 END)`,
        'totalOut',
      )
      .leftJoin('tx.sample', 'sample')
      .leftJoin('tx.warehouse', 'warehouse')
      .where('tx.warehouseId = :warehouseId', { warehouseId })
      .groupBy('tx.sampleId')
      .addGroupBy('sample.sampleCode')
      .addGroupBy('sample.sampleName')
      .addGroupBy('tx.warehouseId')
      .addGroupBy('warehouse.name')
      .having(
        `SUM(CASE WHEN tx.transactionType = 'IN' THEN tx.quantity ELSE 0 END) - SUM(CASE WHEN tx.transactionType = 'OUT' THEN tx.quantity ELSE 0 END) > 0`,
      )
      .getRawMany();

    return result.map((r) => ({
      ...r,
      totalIn: Number(r.totalIn),
      totalOut: Number(r.totalOut),
      currentStock: Number(r.totalIn) - Number(r.totalOut),
    }));
  }

  async getStockCard(sampleId: string, warehouseId?: string) {
    const queryBuilder = this.repository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.sample', 'sample')
      .leftJoinAndSelect('tx.warehouse', 'warehouse')
      .leftJoinAndSelect('tx.storageLocation', 'storageLocation')
      .where('tx.sampleId = :sampleId', { sampleId });

    if (warehouseId) {
      queryBuilder.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    queryBuilder.orderBy('tx.transactionDate', 'ASC');

    const transactions = await queryBuilder.getMany();

    // Calculate running balance
    let balance = 0;
    return transactions.map((tx) => {
      if (tx.transactionType === TransactionType.IN) {
        balance += tx.quantity;
      } else {
        balance -= tx.quantity;
      }
      return {
        ...tx,
        balance,
      };
    });
  }
}
