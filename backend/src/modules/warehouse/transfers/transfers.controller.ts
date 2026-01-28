import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransferFilterDto } from './dto/transfer-filter.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Warehouse - Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouse/transfers')
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phiếu chuyển kho' })
  async findAll(@Query() query: TransferFilterDto) {
    return this.service.findAll(query);
  }

  @Get('generate-number')
  @ApiOperation({ summary: 'Tạo mã phiếu chuyển kho mới' })
  async generateNumber() {
    const number = await this.service.generateTransferNumber();
    return { transferNumber: number };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phiếu chuyển kho' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo phiếu chuyển kho mới' })
  async create(
    @Body() dto: CreateTransferDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật phiếu chuyển kho' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransferDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phiếu chuyển kho' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/send')
  @ApiOperation({ summary: 'Gửi hàng - Xác nhận chuyển kho' })
  async send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.send(id, userId);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Nhận hàng - Xác nhận nhận kho' })
  async receive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.receive(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Hủy phiếu chuyển kho' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.cancel(id, userId);
  }
}
