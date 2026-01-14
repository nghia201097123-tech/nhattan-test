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
import { SeedVarietiesService } from './seed-varieties.service';
import { CreateSeedVarietyDto } from './dto/create-seed-variety.dto';
import { UpdateSeedVarietyDto } from './dto/update-seed-variety.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Catalog - Seed Varieties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/seed-varieties')
export class SeedVarietiesController {
  constructor(private readonly service: SeedVarietiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all seed varieties with pagination' })
  async findAll(
    @Query() query: PaginationDto,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.service.findAll(query, categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seed variety by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new seed variety' })
  async create(
    @Body() dto: CreateSeedVarietyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update seed variety' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeedVarietyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete seed variety' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
