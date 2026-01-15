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
import { CategoryItemsService } from './category-items.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Category Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/category-items')
export class CategoryItemsController {
  constructor(private readonly service: CategoryItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get items by group' })
  async findByGroup(
    @Query('groupId') groupId: string,
    @Query('isActive') isActive?: string,
  ) {
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.service.findByGroup(groupId, active);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category item by id' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create category item' })
  async create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder items in group' })
  async reorder(@Body() body: { groupId: string; itemIds: string[] }) {
    await this.service.reorder(body.groupId, body.itemIds);
    return { message: 'Reordered successfully' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category item' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category item' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.delete(id);
    return { message: 'Deleted successfully' };
  }
}
