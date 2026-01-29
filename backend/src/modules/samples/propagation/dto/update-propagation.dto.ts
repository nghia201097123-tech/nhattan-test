import { PartialType } from '@nestjs/swagger';
import { CreatePropagationDto } from './create-propagation.dto';

export class UpdatePropagationDto extends PartialType(CreatePropagationDto) {}
