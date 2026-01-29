import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { ProviderType } from '../entities/sample-provider.entity';

export class QuerySampleProviderDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ProviderType, description: 'Filter by provider type' })
  @IsOptional()
  @IsEnum(ProviderType, { message: 'Loại nơi cung cấp không hợp lệ' })
  type?: ProviderType;
}
