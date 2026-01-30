import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropagationService } from './propagation.service';
import { CreatePropagationDto, UpdateProgressDto, HarvestResultDto } from './dto/create-propagation.dto';
import { UpdatePropagationDto } from './dto/update-propagation.dto';
import { PropagationFilterDto } from './dto/propagation-filter.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Samples - Propagation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('samples/propagation')
export class PropagationController {
  constructor(private readonly service: PropagationService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đợt nhân mẫu' })
  async findAll(@Query() query: PropagationFilterDto) {
    return this.service.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Thống kê đợt nhân mẫu' })
  async getStatistics() {
    return this.service.getStatistics();
  }

  @Get('by-sample/:sampleId')
  @ApiOperation({ summary: 'Lấy danh sách đợt nhân theo mẫu' })
  async findBySampleId(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    return this.service.findBySampleId(sampleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đợt nhân mẫu' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới đợt nhân mẫu' })
  async create(
    @Body() dto: CreatePropagationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin đợt nhân mẫu' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePropagationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Cập nhật tiến độ nhân mẫu' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgressDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateProgress(id, dto, userId);
  }

  @Post(':id/harvest')
  @ApiOperation({ summary: 'Nhập kết quả thu hoạch' })
  async recordHarvest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: HarvestResultDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.recordHarvest(id, dto, userId);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Hoàn thành đợt nhân mẫu' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.complete(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy đợt nhân mẫu' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.cancel(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đợt nhân mẫu' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
