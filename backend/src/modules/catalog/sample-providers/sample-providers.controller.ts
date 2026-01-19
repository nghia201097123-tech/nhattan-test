import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SampleProvidersService } from './sample-providers.service';
import { CreateSampleProviderDto } from './dto/create-sample-provider.dto';
import { UpdateSampleProviderDto } from './dto/update-sample-provider.dto';
import { QuerySampleProviderDto } from './dto/query-sample-provider.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Catalog - Sample Providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/sample-providers')
export class SampleProvidersController {
  constructor(private readonly service: SampleProvidersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sample providers' })
  async findAll(@Query() query: QuerySampleProviderDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample provider by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new sample provider' })
  async create(
    @Body() dto: CreateSampleProviderDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sample provider' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSampleProviderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sample provider' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
