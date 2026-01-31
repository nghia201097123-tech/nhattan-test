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
import { CollectionService } from './collection.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { SampleFilterDto } from './dto/sample-filter.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Samples - Collection')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('samples')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all samples with filter and pagination' })
  async findAll(@Query() query: SampleFilterDto) {
    return this.service.findAll(query);
  }

  @Get('generate-code')
  @ApiOperation({ summary: 'Generate new sample code' })
  async generateCode() {
    return this.service.generateCode();
  }

  @Get(':id/full-info')
  @ApiOperation({ summary: 'Get sample full info with history, evaluations, propagation' })
  async getFullInfo(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getFullInfo(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get sample inventory history' })
  async getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getHistory(id);
  }

  @Get(':id/evaluations')
  @ApiOperation({ summary: 'Get sample evaluations' })
  async getEvaluations(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getEvaluations(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new sample (collection form)' })
  async create(
    @Body() dto: CreateSampleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sample' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSampleDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete sample' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
