import { PartialType } from '@nestjs/swagger';
import { CreateSeedCategoryDto } from './create-seed-category.dto';

export class UpdateSeedCategoryDto extends PartialType(CreateSeedCategoryDto) {}
