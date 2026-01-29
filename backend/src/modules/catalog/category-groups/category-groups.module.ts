import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from './entities/category-group.entity';
import { CategoryGroupsService } from './category-groups.service';
import { CategoryGroupsController } from './category-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryGroup])],
  controllers: [CategoryGroupsController],
  providers: [CategoryGroupsService],
  exports: [CategoryGroupsService],
})
export class CategoryGroupsModule {}
