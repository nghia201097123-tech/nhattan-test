import { PartialType } from '@nestjs/swagger';
import { CreateSampleProviderDto } from './create-sample-provider.dto';

export class UpdateSampleProviderDto extends PartialType(CreateSampleProviderDto) {}
