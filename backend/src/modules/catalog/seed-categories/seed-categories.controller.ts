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
import { SeedCategoriesService } from './seed-categories.service';
import { CreateSeedCategoryDto } from './dto/create-seed-category.dto';
import { UpdateSeedCategoryDto } from './dto/update-seed-category.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Catalog - Seed Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/seed-categories')
export class SeedCategoriesController {
  constructor(private readonly service: SeedCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seed categories' })
  async findAll(@Query('isActive') isActive?: boolean) {
    return this.service.findAll(isActive);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get seed categories as tree' })
  async getTree() {
    return this.service.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seed category by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct children of a category' })
  async getChildren(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getChildren(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new seed category' })
  async create(
    @Body() dto: CreateSeedCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update seed category' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeedCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete seed category' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder categories' })
  async reorder(@Body() items: { id: string; sortOrder: number }[]) {
    return this.service.reorder(items);
  }
}
