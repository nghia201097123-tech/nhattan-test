import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryItem } from './entities/category-item.entity';
import { CategoryItemsService } from './category-items.service';
import { CategoryItemsController } from './category-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryItem])],
  controllers: [CategoryItemsController],
  providers: [CategoryItemsService],
  exports: [CategoryItemsService],
})
export class CategoryItemsModule {}
