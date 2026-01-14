import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EvaluationOverallResult } from '../entities/sample-evaluation.entity';

export class EvaluationResultDto {
  @ApiProperty()
  @IsUUID()
  criteriaId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  numericValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPassed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateEvaluationDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  sampleId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  stageId: string;

  @ApiProperty()
  @IsDateString()
  evaluationDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  evaluatorId?: string;

  @ApiPropertyOptional({ enum: EvaluationOverallResult })
  @IsOptional()
  @IsEnum(EvaluationOverallResult)
  overallResult?: EvaluationOverallResult;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  germinationRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recommendations?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [EvaluationResultDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationResultDto)
  results?: EvaluationResultDto[];
}
