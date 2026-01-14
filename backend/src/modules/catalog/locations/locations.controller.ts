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
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Catalog - Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  async findAll(@Query('level') level?: number) {
    return this.service.findAll(level);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get locations as tree' })
  async getTree() {
    return this.service.getTree();
  }

  @Get('provinces')
  @ApiOperation({ summary: 'Get all provinces (level 1)' })
  async getProvinces() {
    return this.service.getProvinces();
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get children of a location' })
  async getChildren(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getChildren(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get location by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }
}
