import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransferStatus } from '../entities/warehouse-transfer.entity';

export class TransferFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  fromWarehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  toWarehouseId?: string;

  @ApiPropertyOptional({ enum: TransferStatus })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
