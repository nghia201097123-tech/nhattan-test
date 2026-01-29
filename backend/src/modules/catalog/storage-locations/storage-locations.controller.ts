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
import { StorageLocationsService } from './storage-locations.service';
import { CreateStorageLocationDto } from './dto/create-storage-location.dto';
import { UpdateStorageLocationDto } from './dto/update-storage-location.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Catalog - Storage Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/storage-locations')
export class StorageLocationsController {
  constructor(private readonly service: StorageLocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get storage locations' })
  async findAll(@Query('warehouseId') warehouseId?: string) {
    return this.service.findAll(warehouseId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get storage locations as tree' })
  async getTree(@Query('warehouseId') warehouseId: string) {
    return this.service.getTree(warehouseId);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available storage locations' })
  async getAvailable(@Query('warehouseId') warehouseId: string) {
    return this.service.getAvailable(warehouseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get storage location by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get storage location status' })
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getStatus(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new storage location' })
  async create(@Body() dto: CreateStorageLocationDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update storage location' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStorageLocationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete storage location' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
