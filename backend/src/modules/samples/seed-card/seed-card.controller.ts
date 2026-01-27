import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SeedCardService } from './seed-card.service';
import {
  SeedCardConfigDto,
  GenerateCardDto,
  GenerateBatchCardDto,
} from './dto/seed-card.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Samples - Seed Card & QR Code')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('samples/seed-card')
export class SeedCardController {
  constructor(private readonly service: SeedCardService) {}

  @Get('samples')
  @ApiOperation({ summary: 'Lấy danh sách mẫu để in thẻ' })
  async getSamplesForPrint(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.getSamplesForPrint({
      search,
      categoryId,
      warehouseId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get('config/default')
  @ApiOperation({ summary: 'Lấy cấu hình thẻ mặc định' })
  async getDefaultConfig() {
    return this.service.getDefaultConfig();
  }

  @Get('preview/:sampleId')
  @ApiOperation({ summary: 'Xem preview thẻ giống' })
  async getCardPreview(
    @Param('sampleId', ParseUUIDPipe) sampleId: string,
    @Query() config: SeedCardConfigDto,
  ) {
    return this.service.getCardPreview(sampleId, config);
  }

  @Post('preview/batch')
  @ApiOperation({ summary: 'Xem preview nhiều thẻ giống' })
  async getCardsPreview(@Body() dto: GenerateBatchCardDto) {
    return this.service.getCardsPreview(dto.sampleIds, dto.config);
  }

  @Get('data/:sampleId')
  @ApiOperation({ summary: 'Lấy dữ liệu thẻ giống' })
  async getCardData(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    return this.service.getSampleForCard(sampleId);
  }

  @Post('data/batch')
  @ApiOperation({ summary: 'Lấy dữ liệu nhiều thẻ giống' })
  async getCardsData(@Body() dto: GenerateBatchCardDto) {
    return this.service.getSamplesForCards(dto.sampleIds);
  }

  @Get('qr-code/:sampleId')
  @ApiOperation({ summary: 'Lấy dữ liệu QR Code' })
  async getQRCodeData(@Param('sampleId', ParseUUIDPipe) sampleId: string) {
    const qrData = await this.service.generateQRCodeData(sampleId);
    return { qrData };
  }

  @Post('generate')
  @ApiOperation({ summary: 'Tạo thẻ giống đơn' })
  async generateCard(@Body() dto: GenerateCardDto) {
    return this.service.getCardPreview(dto.sampleId, dto.config);
  }

  @Post('generate/batch')
  @ApiOperation({ summary: 'Tạo nhiều thẻ giống (hàng loạt)' })
  async generateBatchCards(@Body() dto: GenerateBatchCardDto) {
    return this.service.getCardsPreview(dto.sampleIds, dto.config);
  }
}
