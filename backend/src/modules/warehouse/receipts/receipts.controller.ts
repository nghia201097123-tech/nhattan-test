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
import { ReceiptsService } from './receipts.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Warehouse - Receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouse/receipts')
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all receipts' })
  async findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get('generate-code')
  @ApiOperation({ summary: 'Generate receipt code' })
  async generateCode() {
    const code = await this.service.generateCode();
    return { code };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create receipt' })
  async create(@Body() dto: any, @CurrentUser('id') userId: string) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update receipt' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirm receipt - creates IMPORT inventory transactions' })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.confirm(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete receipt' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
