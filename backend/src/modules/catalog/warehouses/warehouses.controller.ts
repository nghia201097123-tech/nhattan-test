import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Catalog - Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/warehouses')
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get warehouse usage statistics' })
  async getUsage(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getUsage(id);
  }

  @Get(':id/locations')
  @ApiOperation({ summary: 'Get storage locations in warehouse' })
  async getLocations(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getLocations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new warehouse' })
  async create(
    @Body() dto: CreateWarehouseDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete warehouse' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
