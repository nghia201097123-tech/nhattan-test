import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsBoolean, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSeedCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? null : value))
  @ValidateIf((o) => o.parentId !== null)
  @IsUUID('4', { message: 'Nhóm cha không hợp lệ' })
  parentId?: string | null;

  @ApiProperty()
  @IsString({ message: 'Mã nhóm phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng nhập mã nhóm' })
  @MaxLength(50, { message: 'Mã nhóm tối đa 50 ký tự' })
  code: string;

  @ApiProperty()
  @IsString({ message: 'Tên nhóm phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên nhóm' })
  @MaxLength(150, { message: 'Tên nhóm tối đa 150 ký tự' })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt({ message: 'Thứ tự sắp xếp phải là số nguyên' })
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là true/false' })
  isActive?: boolean;
}
