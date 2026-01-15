import { IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class QuerySeedVarietyDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId không hợp lệ' })
  categoryId?: string;
}
