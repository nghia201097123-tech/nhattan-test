import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PropagationStatus } from '../entities/propagation-batch.entity';

export class PropagationFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  sampleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  propagatorId?: string;

  @ApiPropertyOptional({ enum: PropagationStatus })
  @IsOptional()
  @IsEnum(PropagationStatus)
  status?: PropagationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  startDateTo?: string;

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
