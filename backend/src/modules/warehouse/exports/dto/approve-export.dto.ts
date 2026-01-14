import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveExportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectExportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectReason?: string;
}
