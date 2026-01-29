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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Samples - Evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly service: EvaluationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all evaluations' })
  async findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get samples pending evaluation' })
  async getPending() {
    return this.service.getPendingEvaluations();
  }

  @Get('by-sample/:sampleId')
  @ApiOperation({ summary: 'Get evaluations by sample' })
  async getBySample(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    return this.service.getBySampleId(sampleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new evaluation' })
  async create(
    @Body() dto: CreateEvaluationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update evaluation' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete evaluation' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
