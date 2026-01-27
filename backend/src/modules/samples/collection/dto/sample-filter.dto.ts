import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SampleStatus } from '../../../../shared/constants/sample-status.constant';

export class SampleFilterDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: SampleStatus })
  @IsOptional()
  @IsEnum(SampleStatus)
  status?: SampleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  collectionDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  collectionDateTo?: string;
}
