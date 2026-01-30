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
      .leftJoinAndSelect('tx.location', 'location');

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

    queryBuilder.orderBy(`tx.${sortBy}`, sortOrder).skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return createPaginatedResult(data, total, page, limit);
  }

  async getStockBySample(sampleId: string) {
    const result = await this.repository
      .createQueryBuilder('tx')
      .select('tx.sampleId', 'sampleId')
      .addSelect('sample.sampleCode', 'sampleCode')
      .addSelect('sample.sampleName', 'sampleName')
      .addSelect('tx.warehouseId', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(`SUM(CASE WHEN tx.transactionType = 'IMPORT' THEN tx.quantity ELSE 0 END)`, 'totalIn')
      .addSelect(`SUM(CASE WHEN tx.transactionType = 'EXPORT' THEN tx.quantity ELSE 0 END)`, 'totalOut')
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

  async getStockByWarehouse(warehouseId: string) {
    const result = await this.repository
      .createQueryBuilder('tx')
      .select('tx.sampleId', 'sampleId')
      .addSelect('sample.sampleCode', 'sampleCode')
      .addSelect('sample.sampleName', 'sampleName')
      .addSelect('tx.warehouseId', 'warehouseId')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(`SUM(CASE WHEN tx.transactionType = 'IMPORT' THEN tx.quantity ELSE 0 END)`, 'totalIn')
      .addSelect(`SUM(CASE WHEN tx.transactionType = 'EXPORT' THEN tx.quantity ELSE 0 END)`, 'totalOut')
      .leftJoin('tx.sample', 'sample')
      .leftJoin('tx.warehouse', 'warehouse')
      .where('tx.warehouseId = :warehouseId', { warehouseId })
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

  async getStockCard(sampleId: string, warehouseId?: string) {
    const queryBuilder = this.repository
      .createQueryBuilder('tx')
      .leftJoinAndSelect('tx.sample', 'sample')
      .leftJoinAndSelect('tx.warehouse', 'warehouse')
      .leftJoinAndSelect('tx.location', 'location')
      .where('tx.sampleId = :sampleId', { sampleId });

    if (warehouseId) {
      queryBuilder.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    queryBuilder.orderBy('tx.transactionDate', 'ASC');
    const transactions = await queryBuilder.getMany();

    let balance = 0;
    return transactions.map((tx) => {
      if (tx.transactionType === TransactionType.IMPORT || tx.transactionType === TransactionType.TRANSFER_IN) {
        balance += Number(tx.quantity);
      } else if (tx.transactionType === TransactionType.EXPORT || tx.transactionType === TransactionType.TRANSFER_OUT) {
        balance -= Math.abs(Number(tx.quantity));
      } else if (tx.transactionType === TransactionType.ADJUSTMENT) {
        balance += Number(tx.quantity);
      }
      return { ...tx, balance };
    });
  }

  // Thống kê nhập-xuất-tồn theo kỳ
  async getInventoryReport(query: {
    warehouseId?: string;
    categoryId?: string;
    fromDate: string;
    toDate: string;
  }) {
    const { warehouseId, categoryId, fromDate, toDate } = query;

    const qb = this.repository
      .createQueryBuilder('tx')
      .select('tx.sampleId', 'sampleId')
      .addSelect('sample.code', 'sampleCode')
      .addSelect('sample.varietyName', 'varietyName')
      .addSelect('sample.localName', 'localName')
      .addSelect('category.name', 'categoryName')
      .addSelect('warehouse.name', 'warehouseName')
      .addSelect(`SUM(CASE WHEN tx.transactionType IN ('IMPORT', 'TRANSFER_IN') AND tx.quantity > 0 THEN tx.quantity ELSE 0 END)`, 'totalIn')
      .addSelect(`SUM(CASE WHEN tx.transactionType IN ('EXPORT', 'TRANSFER_OUT') THEN ABS(tx.quantity) ELSE 0 END)`, 'totalOut')
      .addSelect(`SUM(CASE WHEN tx.transactionType = 'ADJUSTMENT' THEN tx.quantity ELSE 0 END)`, 'adjustment')
      .leftJoin('tx.sample', 'sample')
      .leftJoin('sample.category', 'category')
      .leftJoin('tx.warehouse', 'warehouse')
      .where('tx.transactionDate >= :fromDate', { fromDate })
      .andWhere('tx.transactionDate <= :toDate', { toDate });

    if (warehouseId) {
      qb.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    if (categoryId) {
      qb.andWhere('sample.categoryId = :categoryId', { categoryId });
    }

    qb.groupBy('tx.sampleId')
      .addGroupBy('sample.code')
      .addGroupBy('sample.varietyName')
      .addGroupBy('sample.localName')
      .addGroupBy('category.name')
      .addGroupBy('warehouse.name');

    const data = await qb.getRawMany();

    return data.map((r) => ({
      sampleId: r.sampleId,
      sampleCode: r.sampleCode,
      varietyName: r.varietyName || r.localName,
      categoryName: r.categoryName,
      warehouseName: r.warehouseName,
      totalIn: Number(r.totalIn) || 0,
      totalOut: Number(r.totalOut) || 0,
      adjustment: Number(r.adjustment) || 0,
      netChange: (Number(r.totalIn) || 0) - (Number(r.totalOut) || 0) + (Number(r.adjustment) || 0),
    }));
  }

  // Thống kê tổng quan
  async getSummaryStatistics(query: { warehouseId?: string; fromDate?: string; toDate?: string }) {
    const { warehouseId, fromDate, toDate } = query;

    const qb = this.repository.createQueryBuilder('tx');

    if (warehouseId) {
      qb.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    if (fromDate) {
      qb.andWhere('tx.transactionDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('tx.transactionDate <= :toDate', { toDate });
    }

    const stats = await qb
      .select(`SUM(CASE WHEN tx.transactionType IN ('IMPORT', 'TRANSFER_IN') AND tx.quantity > 0 THEN tx.quantity ELSE 0 END)`, 'totalImport')
      .addSelect(`SUM(CASE WHEN tx.transactionType IN ('EXPORT', 'TRANSFER_OUT') THEN ABS(tx.quantity) ELSE 0 END)`, 'totalExport')
      .addSelect(`COUNT(DISTINCT tx.sampleId)`, 'totalSamples')
      .addSelect(`COUNT(DISTINCT CASE WHEN tx.transactionType = 'IMPORT' THEN tx.referenceId END)`, 'receiptCount')
      .addSelect(`COUNT(DISTINCT CASE WHEN tx.transactionType = 'EXPORT' THEN tx.referenceId END)`, 'exportCount')
      .addSelect(`COUNT(DISTINCT CASE WHEN tx.transactionType IN ('TRANSFER_IN', 'TRANSFER_OUT') THEN tx.referenceId END)`, 'transferCount')
      .getRawOne();

    return {
      totalImport: Number(stats.totalImport) || 0,
      totalExport: Number(stats.totalExport) || 0,
      totalSamples: Number(stats.totalSamples) || 0,
      receiptCount: Number(stats.receiptCount) || 0,
      exportCount: Number(stats.exportCount) || 0,
      transferCount: Number(stats.transferCount) || 0,
    };
  }

  // Biểu đồ biến động theo thời gian
  async getMovementChart(query: { warehouseId?: string; fromDate: string; toDate: string; groupBy: 'day' | 'week' | 'month' }) {
    const { warehouseId, fromDate, toDate, groupBy } = query;

    let dateFormat: string;
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'IYYY-IW';
        break;
      case 'month':
      default:
        dateFormat = 'YYYY-MM';
    }

    const qb = this.repository
      .createQueryBuilder('tx')
      .select(`TO_CHAR(tx.transactionDate, '${dateFormat}')`, 'period')
      .addSelect(`SUM(CASE WHEN tx.transactionType IN ('IMPORT', 'TRANSFER_IN') AND tx.quantity > 0 THEN tx.quantity ELSE 0 END)`, 'totalIn')
      .addSelect(`SUM(CASE WHEN tx.transactionType IN ('EXPORT', 'TRANSFER_OUT') THEN ABS(tx.quantity) ELSE 0 END)`, 'totalOut')
      .where('tx.transactionDate >= :fromDate', { fromDate })
      .andWhere('tx.transactionDate <= :toDate', { toDate });

    if (warehouseId) {
      qb.andWhere('tx.warehouseId = :warehouseId', { warehouseId });
    }

    qb.groupBy('period').orderBy('period', 'ASC');

    const data = await qb.getRawMany();

    return data.map((r) => ({
      period: r.period,
      totalIn: Number(r.totalIn) || 0,
      totalOut: Number(r.totalOut) || 0,
    }));
  }
}
