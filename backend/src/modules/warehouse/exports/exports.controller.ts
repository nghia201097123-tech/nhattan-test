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
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ExportStatus } from '../../../shared/constants/export-status.constant';

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
  async create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update export' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit export for approval' })
  async submitForApproval(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.submitForApproval(id, userId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve export' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { notes?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.service.approve(id, userId, dto.notes);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject export' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { rejectReason?: string },
    @CurrentUser('id') userId: string,
  ) {
    return this.service.reject(id, userId, dto.rejectReason);
  }

  @Post(':id/exported')
  @ApiOperation({ summary: 'Mark export as exported - creates inventory transactions' })
  async exported(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.exported(id, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel export' })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(id);
  }

  @Post(':id/resubmit')
  @ApiOperation({ summary: 'Resubmit rejected export back to draft' })
  async resubmit(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.resubmit(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete export' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
