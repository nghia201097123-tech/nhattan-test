import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService, InventoryQueryDto } from './inventory.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Warehouse - Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouse/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory transactions' })
  async findAll(@Query() query: InventoryQueryDto) {
    return this.service.findAll(query);
  }

  @Get('available-stock')
  @ApiOperation({ summary: 'Get available stock for a sample in a warehouse' })
  async getAvailableStock(
    @Query('warehouseId') warehouseId: string,
    @Query('sampleId') sampleId: string,
  ) {
    return this.service.getAvailableStock(warehouseId, sampleId);
  }

  @Get('available-stock-by-warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get all available stock in a warehouse' })
  async getAvailableStockByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    return this.service.getAvailableStockByWarehouse(warehouseId);
  }

  @Get('sample/:sampleId')
  @ApiOperation({ summary: 'Get stock summary by sample' })
  async getStockBySample(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    return this.service.getStockBySample(sampleId);
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get stock summary by warehouse' })
  async getStockByWarehouse(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    return this.service.getStockByWarehouse(warehouseId);
  }

  @Get('stock-card/:sampleId')
  @ApiOperation({ summary: 'Get stock card for a sample' })
  async getStockCard(
    @Param('sampleId', ParseUUIDPipe) sampleId: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.service.getStockCard(sampleId, warehouseId);
  }

  @Get('report')
  @ApiOperation({ summary: 'Báo cáo nhập-xuất-tồn theo kỳ' })
  async getInventoryReport(
    @Query('warehouseId') warehouseId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const from = fromDate || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const to = toDate || new Date().toISOString().slice(0, 10);
    return this.service.getInventoryReport({ warehouseId, categoryId, fromDate: from, toDate: to });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Thống kê tổng quan kho' })
  async getSummaryStatistics(
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.service.getSummaryStatistics({ warehouseId, fromDate, toDate });
  }

  @Get('chart')
  @ApiOperation({ summary: 'Biểu đồ biến động nhập-xuất' })
  async getMovementChart(
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const from = fromDate || new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
    const to = toDate || new Date().toISOString().slice(0, 10);
    return this.service.getMovementChart({ warehouseId, fromDate: from, toDate: to, groupBy: groupBy || 'month' });
  }
}
