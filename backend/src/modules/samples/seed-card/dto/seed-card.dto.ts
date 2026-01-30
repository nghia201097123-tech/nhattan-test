import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class SeedCardConfigDto {
  @ApiPropertyOptional({ description: 'Hiển thị mã mẫu' })
  @IsOptional()
  @IsBoolean()
  showCode?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị tên giống' })
  @IsOptional()
  @IsBoolean()
  showVarietyName?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị loại cây' })
  @IsOptional()
  @IsBoolean()
  showCategory?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị ngày thu thập' })
  @IsOptional()
  @IsBoolean()
  showCollectionDate?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị địa điểm' })
  @IsOptional()
  @IsBoolean()
  showLocation?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị nguồn gốc' })
  @IsOptional()
  @IsBoolean()
  showProvider?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị tên khoa học' })
  @IsOptional()
  @IsBoolean()
  showScientificName?: boolean = false;

  @ApiPropertyOptional({ description: 'Hiển thị tỷ lệ nảy mầm' })
  @IsOptional()
  @IsBoolean()
  showGerminationRate?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị ngày hết hạn' })
  @IsOptional()
  @IsBoolean()
  showExpiryDate?: boolean = true;

  @ApiPropertyOptional({ description: 'Hiển thị vị trí lưu trữ' })
  @IsOptional()
  @IsBoolean()
  showStorageLocation?: boolean = false;

  @ApiPropertyOptional({ description: 'Hiển thị QR Code' })
  @IsOptional()
  @IsBoolean()
  showQRCode?: boolean = true;

  @ApiPropertyOptional({ description: 'Kích thước QR Code (px)' })
  @IsOptional()
  @IsNumber()
  qrCodeSize?: number = 80;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Tiêu đề thẻ' })
  @IsOptional()
  @IsString()
  cardTitle?: string = 'THẺ GIỐNG';

  @ApiPropertyOptional({ description: 'Chiều rộng thẻ (mm)' })
  @IsOptional()
  @IsNumber()
  cardWidth?: number = 85;

  @ApiPropertyOptional({ description: 'Chiều cao thẻ (mm)' })
  @IsOptional()
  @IsNumber()
  cardHeight?: number = 54;
}

export class GenerateCardDto {
  @ApiProperty({ description: 'ID của mẫu' })
  @IsNotEmpty()
  @IsUUID()
  sampleId: string;

  @ApiPropertyOptional({ description: 'Cấu hình thẻ' })
  @IsOptional()
  config?: SeedCardConfigDto;
}

export class GenerateBatchCardDto {
  @ApiProperty({ description: 'Danh sách ID mẫu' })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  sampleIds: string[];

  @ApiPropertyOptional({ description: 'Cấu hình thẻ' })
  @IsOptional()
  config?: SeedCardConfigDto;
}

export class ExportQRCodeDto {
  @ApiProperty({ description: 'ID của mẫu' })
  @IsNotEmpty()
  @IsUUID()
  sampleId: string;

  @ApiPropertyOptional({ description: 'Kích thước QR Code (px)' })
  @IsOptional()
  @IsNumber()
  size?: number = 200;

  @ApiPropertyOptional({ description: 'Định dạng xuất (png, svg)' })
  @IsOptional()
  @IsString()
  format?: 'png' | 'svg' = 'png';
}

export class SeedCardDataDto {
  id: string;
  code: string;
  varietyName: string;
  categoryName: string;
  scientificName?: string;
  collectionDate: Date;
  location?: string;
  providerName?: string;
  germinationRate?: number;
  expiryDate?: Date;
  storageLocation?: string;
  qrCodeData: string;
}
