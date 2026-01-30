import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsString, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferItemDto {
  @ApiProperty()
  @IsUUID()
  sampleId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fromLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  toLocationId?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateTransferDto {
  @ApiProperty()
  @IsUUID()
  fromWarehouseId: string;

  @ApiProperty()
  @IsUUID()
  toWarehouseId: string;

  @ApiProperty()
  @IsDateString()
  transferDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateTransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items: CreateTransferItemDto[];
}
