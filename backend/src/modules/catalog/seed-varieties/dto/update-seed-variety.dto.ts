import { PartialType } from '@nestjs/swagger';
import { CreateSeedVarietyDto } from './create-seed-variety.dto';

export class UpdateSeedVarietyDto extends PartialType(CreateSeedVarietyDto) {}
