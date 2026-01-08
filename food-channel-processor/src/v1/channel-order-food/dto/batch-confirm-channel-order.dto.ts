import { IsArray, ArrayNotEmpty, IsNumber, IsInt, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchConfirmChannelOrderDto {


  @IsInt()
  @Type(() => Number)
  restaurant_id: number;
  
  @IsArray({ message: 'ids phải là một mảng.' })
  @ArrayNotEmpty({ message: 'ids không được để trống.' })
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 phần tử trong danh sách.' })
  @ArrayMaxSize(10, { message: 'Không được truyền quá 10 phần tử trong danhs sách.' })
  @IsNumber({}, { each: true, message: 'Mỗi phần tử trong danh sách phải là số.' })
  @Type(() => Number)
  ids: number[];

  @IsInt()
  @Type(() => Number)
  branch_id: number;

}
