import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReceiptDto } from './create-receipt.dto';

export class UpdateReceiptDto extends PartialType(
  OmitType(CreateReceiptDto, ['items'] as const),
) {}
