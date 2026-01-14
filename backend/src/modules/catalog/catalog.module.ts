import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SeedCategory } from './seed-categories/entities/seed-category.entity';
import { SeedVariety } from './seed-varieties/entities/seed-variety.entity';
import { Location } from './locations/entities/location.entity';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { StorageLocation } from './storage-locations/entities/storage-location.entity';
import { Staff } from './staff/entities/staff.entity';
import { SampleProvider } from './sample-providers/entities/sample-provider.entity';

// Controllers
import { SeedCategoriesController } from './seed-categories/seed-categories.controller';
import { SeedVarietiesController } from './seed-varieties/seed-varieties.controller';
import { LocationsController } from './locations/locations.controller';
import { WarehousesController } from './warehouses/warehouses.controller';
import { StorageLocationsController } from './storage-locations/storage-locations.controller';
import { StaffController } from './staff/staff.controller';
import { SampleProvidersController } from './sample-providers/sample-providers.controller';

// Services
import { SeedCategoriesService } from './seed-categories/seed-categories.service';
import { SeedVarietiesService } from './seed-varieties/seed-varieties.service';
import { LocationsService } from './locations/locations.service';
import { WarehousesService } from './warehouses/warehouses.service';
import { StorageLocationsService } from './storage-locations/storage-locations.service';
import { StaffService } from './staff/staff.service';
import { SampleProvidersService } from './sample-providers/sample-providers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SeedCategory,
      SeedVariety,
      Location,
      Warehouse,
      StorageLocation,
      Staff,
      SampleProvider,
    ]),
  ],
  controllers: [
    SeedCategoriesController,
    SeedVarietiesController,
    LocationsController,
    WarehousesController,
    StorageLocationsController,
    StaffController,
    SampleProvidersController,
  ],
  providers: [
    SeedCategoriesService,
    SeedVarietiesService,
    LocationsService,
    WarehousesService,
    StorageLocationsService,
    StaffService,
    SampleProvidersService,
  ],
  exports: [
    SeedCategoriesService,
    SeedVarietiesService,
    LocationsService,
    WarehousesService,
    StorageLocationsService,
    StaffService,
    SampleProvidersService,
  ],
})
export class CatalogModule {}
