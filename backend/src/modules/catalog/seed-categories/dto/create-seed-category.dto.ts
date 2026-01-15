import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsBoolean, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSeedCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? null : value))
  @ValidateIf((o) => o.parentId !== null)
  @IsUUID()
  parentId?: string | null;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
