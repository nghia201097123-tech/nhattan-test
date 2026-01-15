import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSeedVarietyDto {
  @ApiProperty()
  @IsUUID('4', { message: 'Nhóm giống không hợp lệ' })
  @IsNotEmpty({ message: 'Vui lòng chọn nhóm giống' })
  categoryId: string;

  @ApiProperty()
  @IsString({ message: 'Mã giống phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng nhập mã giống' })
  @MaxLength(50, { message: 'Mã giống tối đa 50 ký tự' })
  code: string;

  @ApiProperty()
  @IsString({ message: 'Tên giống phải là chuỗi' })
  @IsNotEmpty({ message: 'Vui lòng nhập tên giống' })
  @MaxLength(200, { message: 'Tên giống tối đa 200 ký tự' })
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Tên khoa học phải là chuỗi' })
  @MaxLength(200, { message: 'Tên khoa học tối đa 200 ký tự' })
  scientificName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Tên địa phương phải là chuỗi' })
  @MaxLength(200, { message: 'Tên địa phương tối đa 200 ký tự' })
  localName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Xuất xứ phải là chuỗi' })
  @MaxLength(200, { message: 'Xuất xứ tối đa 200 ký tự' })
  origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Đặc điểm phải là chuỗi' })
  characteristics?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Thời gian sinh trưởng phải là chuỗi' })
  @MaxLength(100, { message: 'Thời gian sinh trưởng tối đa 100 ký tự' })
  growthDuration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Năng suất tiềm năng phải là chuỗi' })
  @MaxLength(100, { message: 'Năng suất tiềm năng tối đa 100 ký tự' })
  yieldPotential?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Khả năng chống bệnh phải là chuỗi' })
  diseaseResistance?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'URL ảnh phải là chuỗi' })
  @MaxLength(500, { message: 'URL ảnh tối đa 500 ký tự' })
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là true/false' })
  isActive?: boolean;
}
