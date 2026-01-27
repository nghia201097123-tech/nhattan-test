import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { PropagationStatus } from '../entities/propagation-batch.entity';

export class CreatePropagationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ description: 'ID của mẫu gốc' })
  @IsNotEmpty()
  @IsUUID()
  sampleId: string;

  @ApiPropertyOptional({ description: 'ID người phụ trách' })
  @IsOptional()
  @IsUUID()
  propagatorId?: string;

  @ApiProperty({ description: 'Ngày bắt đầu' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'Ngày dự kiến kết thúc' })
  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @ApiProperty({ description: 'Số lượng ban đầu' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  initialQuantity: number;

  @ApiPropertyOptional({ description: 'Đơn vị' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  initialUnit?: string;

  @ApiPropertyOptional({ description: 'Vị trí nhân mẫu' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  propagationLocation?: string;

  @ApiPropertyOptional({ description: 'Phương pháp nhân giống' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  propagationMethod?: string;

  @ApiPropertyOptional({ description: 'Điều kiện môi trường' })
  @IsOptional()
  @IsString()
  environmentConditions?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProgressDto {
  @ApiProperty({ description: 'Tiến độ (0-100)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsEnum(PropagationStatus)
  status?: PropagationStatus;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class HarvestResultDto {
  @ApiProperty({ description: 'Ngày thu hoạch' })
  @IsNotEmpty()
  @IsDateString()
  harvestDate: string;

  @ApiProperty({ description: 'Số lượng thu hoạch' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  harvestQuantity: number;

  @ApiPropertyOptional({ description: 'Đơn vị' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  harvestUnit?: string;

  @ApiPropertyOptional({ description: 'Đánh giá chất lượng (A, B, C, D)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  qualityRating?: string;

  @ApiPropertyOptional({ description: 'Kho lưu trữ kết quả' })
  @IsOptional()
  @IsUUID()
  resultWarehouseId?: string;

  @ApiPropertyOptional({ description: 'Vị trí lưu trữ kết quả' })
  @IsOptional()
  @IsUUID()
  resultLocationId?: string;

  @ApiPropertyOptional({ description: 'Ghi chú thu hoạch' })
  @IsOptional()
  @IsString()
  harvestNotes?: string;
}
