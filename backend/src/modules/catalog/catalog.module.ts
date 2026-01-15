import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Existing Entities
import { SeedCategory } from './seed-categories/entities/seed-category.entity';
import { SeedVariety } from './seed-varieties/entities/seed-variety.entity';
import { Location } from './locations/entities/location.entity';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { StorageLocation } from './storage-locations/entities/storage-location.entity';
import { Staff } from './staff/entities/staff.entity';
import { SampleProvider } from './sample-providers/entities/sample-provider.entity';

// New Entities
import { EvaluationCriteria } from './evaluation-criteria/entities/evaluation-criteria.entity';
import { EvaluationStage } from './evaluation-criteria/entities/evaluation-stage.entity';
import { CriteriaScore } from './evaluation-criteria/entities/criteria-score.entity';
import { ExportReason } from './export-reasons/entities/export-reason.entity';
import { CategoryGroup } from './category-groups/entities/category-group.entity';
import { CategoryItem } from './category-items/entities/category-item.entity';

// Existing Controllers
import { SeedCategoriesController } from './seed-categories/seed-categories.controller';
import { SeedVarietiesController } from './seed-varieties/seed-varieties.controller';
import { LocationsController } from './locations/locations.controller';
import { WarehousesController } from './warehouses/warehouses.controller';
import { StorageLocationsController } from './storage-locations/storage-locations.controller';
import { StaffController } from './staff/staff.controller';
import { SampleProvidersController } from './sample-providers/sample-providers.controller';

// New Controllers
import { EvaluationCriteriaController } from './evaluation-criteria/evaluation-criteria.controller';
import { ExportReasonsController } from './export-reasons/export-reasons.controller';
import { CategoryGroupsController } from './category-groups/category-groups.controller';
import { CategoryItemsController } from './category-items/category-items.controller';

// Existing Services
import { SeedCategoriesService } from './seed-categories/seed-categories.service';
import { SeedVarietiesService } from './seed-varieties/seed-varieties.service';
import { LocationsService } from './locations/locations.service';
import { WarehousesService } from './warehouses/warehouses.service';
import { StorageLocationsService } from './storage-locations/storage-locations.service';
import { StaffService } from './staff/staff.service';
import { SampleProvidersService } from './sample-providers/sample-providers.service';

// New Services
import { EvaluationCriteriaService } from './evaluation-criteria/evaluation-criteria.service';
import { ExportReasonsService } from './export-reasons/export-reasons.service';
import { CategoryGroupsService } from './category-groups/category-groups.service';
import { CategoryItemsService } from './category-items/category-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Existing
      SeedCategory,
      SeedVariety,
      Location,
      Warehouse,
      StorageLocation,
      Staff,
      SampleProvider,
      // New
      EvaluationCriteria,
      EvaluationStage,
      CriteriaScore,
      ExportReason,
      CategoryGroup,
      CategoryItem,
    ]),
  ],
  controllers: [
    // Existing
    SeedCategoriesController,
    SeedVarietiesController,
    LocationsController,
    WarehousesController,
    StorageLocationsController,
    StaffController,
    SampleProvidersController,
    // New
    EvaluationCriteriaController,
    ExportReasonsController,
    CategoryGroupsController,
    CategoryItemsController,
  ],
  providers: [
    // Existing
    SeedCategoriesService,
    SeedVarietiesService,
    LocationsService,
    WarehousesService,
    StorageLocationsService,
    StaffService,
    SampleProvidersService,
    // New
    EvaluationCriteriaService,
    ExportReasonsService,
    CategoryGroupsService,
    CategoryItemsService,
  ],
  exports: [
    // Existing
    SeedCategoriesService,
    SeedVarietiesService,
    LocationsService,
    WarehousesService,
    StorageLocationsService,
    StaffService,
    SampleProvidersService,
    // New
    EvaluationCriteriaService,
    ExportReasonsService,
    CategoryGroupsService,
    CategoryItemsService,
  ],
})
export class CatalogModule {}
