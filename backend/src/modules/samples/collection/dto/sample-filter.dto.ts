import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SampleStatus } from '../../../../shared/constants/sample-status.constant';

export class SampleFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: SampleStatus })
  @IsOptional()
  @IsEnum(SampleStatus)
  status?: SampleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  collectionDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @IsDateString()
  collectionDateTo?: string;
}
