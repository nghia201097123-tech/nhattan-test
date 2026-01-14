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
import { ExportsService } from './exports.service';
import { CreateExportDto } from './dto/create-export.dto';
import { UpdateExportDto } from './dto/update-export.dto';
import { ApproveExportDto, RejectExportDto } from './dto/approve-export.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ExportStatus } from './entities/warehouse-export.entity';

@ApiTags('Warehouse - Exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouse/exports')
export class ExportsController {
  constructor(private readonly service: ExportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all exports' })
  async findAll(@Query() query: PaginationDto & { status?: ExportStatus }) {
    return this.service.findAll(query);
  }

  @Get('generate-code')
  @ApiOperation({ summary: 'Generate export code' })
  async generateCode() {
    const code = await this.service.generateCode();
    return { code };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get export by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create export request' })
  async create(
    @Body() dto: CreateExportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update export' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExportDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit export for approval' })
  async submitForApproval(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.submitForApproval(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve export' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveExportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.approve(id, userId, dto.notes);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject export' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectExportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.reject(id, userId, dto.rejectReason);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute export (actually export items)' })
  async executeExport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.executeExport(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete export' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
