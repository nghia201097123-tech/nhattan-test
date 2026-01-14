import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateExportDto } from './create-export.dto';

export class UpdateExportDto extends PartialType(
  OmitType(CreateExportDto, ['items'] as const),
) {}
