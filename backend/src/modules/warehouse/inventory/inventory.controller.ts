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
}
