import api from '@/lib/api';
import {
  SeedCategory,
  SeedVariety,
  Location,
  Warehouse,
  StorageLocation,
  Staff,
  SampleProvider,
  PaginatedResult,
  PaginationParams,
} from '@/types';

// Seed Categories
export const seedCategoriesService = {
  async getAll(): Promise<SeedCategory[]> {
    const response = await api.get<SeedCategory[]>('/catalog/seed-categories');
    return response.data;
  },

  async getTree(): Promise<SeedCategory[]> {
    const response = await api.get<SeedCategory[]>('/catalog/seed-categories/tree');
    return response.data;
  },

  async getById(id: string): Promise<SeedCategory> {
    const response = await api.get<SeedCategory>(`/catalog/seed-categories/${id}`);
    return response.data;
  },

  async create(data: Partial<SeedCategory>): Promise<SeedCategory> {
    const response = await api.post<SeedCategory>('/catalog/seed-categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<SeedCategory>): Promise<SeedCategory> {
    const response = await api.put<SeedCategory>(`/catalog/seed-categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/seed-categories/${id}`);
  },
};

// Seed Varieties
export const seedVarietiesService = {
  async getAll(params?: PaginationParams & { categoryId?: string }): Promise<PaginatedResult<SeedVariety>> {
    const response = await api.get<PaginatedResult<SeedVariety>>(
      '/catalog/seed-varieties',
      { params }
    );
    return response.data;
  },

  async getByCategory(categoryId: string): Promise<SeedVariety[]> {
    const response = await api.get<PaginatedResult<SeedVariety>>(
      '/catalog/seed-varieties',
      { params: { categoryId, page: 1, limit: 500 } }
    );
    return response.data?.data || [];
  },

  async getById(id: string): Promise<SeedVariety> {
    const response = await api.get<SeedVariety>(`/catalog/seed-varieties/${id}`);
    return response.data;
  },

  async create(data: Partial<SeedVariety>): Promise<SeedVariety> {
    const response = await api.post<SeedVariety>('/catalog/seed-varieties', data);
    return response.data;
  },

  async update(id: string, data: Partial<SeedVariety>): Promise<SeedVariety> {
    const response = await api.put<SeedVariety>(`/catalog/seed-varieties/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/seed-varieties/${id}`);
  },
};

// Locations
export const locationsService = {
  async getTree(): Promise<Location[]> {
    const response = await api.get<Location[]>('/catalog/locations/tree');
    return response.data;
  },

  async getById(id: string): Promise<Location> {
    const response = await api.get<Location>(`/catalog/locations/${id}`);
    return response.data;
  },

  async create(data: Partial<Location>): Promise<Location> {
    const response = await api.post<Location>('/catalog/locations', data);
    return response.data;
  },

  async update(id: string, data: Partial<Location>): Promise<Location> {
    const response = await api.put<Location>(`/catalog/locations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/locations/${id}`);
  },
};

// Warehouses
export const warehousesService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<Warehouse>> {
    const response = await api.get<Warehouse[]>('/catalog/warehouses', {
      params,
    });
    // Backend returns array directly, wrap it in PaginatedResult format
    const data = response.data;
    return {
      data: Array.isArray(data) ? data : [],
      meta: {
        total: Array.isArray(data) ? data.length : 0,
        page: 1,
        limit: Array.isArray(data) ? data.length : 0,
        totalPages: 1,
      },
    };
  },

  async getById(id: string): Promise<Warehouse> {
    const response = await api.get<Warehouse>(`/catalog/warehouses/${id}`);
    return response.data;
  },

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.post<Warehouse>('/catalog/warehouses', data);
    return response.data;
  },

  async update(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put<Warehouse>(`/catalog/warehouses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/warehouses/${id}`);
  },
};

// Storage Locations
export const storageLocationsService = {
  async getByWarehouse(warehouseId: string): Promise<StorageLocation[]> {
    const response = await api.get<StorageLocation[]>(
      '/catalog/storage-locations',
      { params: { warehouseId } }
    );
    return response.data;
  },

  async getAll(params?: PaginationParams & { warehouseId?: string }): Promise<PaginatedResult<StorageLocation>> {
    const response = await api.get<StorageLocation[]>(
      '/catalog/storage-locations',
      { params }
    );
    const data = response.data;
    return {
      data: Array.isArray(data) ? data : [],
      meta: {
        total: Array.isArray(data) ? data.length : 0,
        page: 1,
        limit: Array.isArray(data) ? data.length : 0,
        totalPages: 1,
      },
    };
  },

  async getTree(warehouseId: string): Promise<StorageLocation[]> {
    const response = await api.get<StorageLocation[]>(
      '/catalog/storage-locations/tree',
      { params: { warehouseId } }
    );
    return response.data;
  },

  // Get flat list with full path names for dropdowns
  async getFlatWithPath(warehouseId: string): Promise<Array<StorageLocation & { fullPath: string }>> {
    const tree = await this.getTree(warehouseId);
    const result: Array<StorageLocation & { fullPath: string }> = [];

    const flatten = (items: any[], parentPath: string = '') => {
      for (const item of items) {
        const currentPath = parentPath ? `${parentPath} > ${item.name}` : item.name;
        result.push({ ...item, fullPath: currentPath });
        if (item.children && item.children.length > 0) {
          flatten(item.children, currentPath);
        }
      }
    };

    flatten(tree);
    return result;
  },

  async getById(id: string): Promise<StorageLocation> {
    const response = await api.get<StorageLocation>(`/catalog/storage-locations/${id}`);
    return response.data;
  },

  async create(data: Partial<StorageLocation>): Promise<StorageLocation> {
    const response = await api.post<StorageLocation>('/catalog/storage-locations', data);
    return response.data;
  },

  async update(id: string, data: Partial<StorageLocation>): Promise<StorageLocation> {
    const response = await api.put<StorageLocation>(
      `/catalog/storage-locations/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/storage-locations/${id}`);
  },
};

// Staff
export const staffService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<Staff>> {
    const response = await api.get<PaginatedResult<Staff>>('/catalog/staff', { params });
    return response.data;
  },

  async getByRole(role: string): Promise<Staff[]> {
    const response = await api.get<Staff[]>(`/catalog/staff/by-role/${role}`);
    return response.data;
  },

  async getById(id: string): Promise<Staff> {
    const response = await api.get<Staff>(`/catalog/staff/${id}`);
    return response.data;
  },

  async create(data: Partial<Staff>): Promise<Staff> {
    const response = await api.post<Staff>('/catalog/staff', data);
    return response.data;
  },

  async update(id: string, data: Partial<Staff>): Promise<Staff> {
    const response = await api.put<Staff>(`/catalog/staff/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/staff/${id}`);
  },
};

// Sample Providers
export const sampleProvidersService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<SampleProvider>> {
    const response = await api.get<PaginatedResult<SampleProvider>>(
      '/catalog/sample-providers',
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<SampleProvider> {
    const response = await api.get<SampleProvider>(`/catalog/sample-providers/${id}`);
    return response.data;
  },

  async create(data: Partial<SampleProvider>): Promise<SampleProvider> {
    const response = await api.post<SampleProvider>('/catalog/sample-providers', data);
    return response.data;
  },

  async update(id: string, data: Partial<SampleProvider>): Promise<SampleProvider> {
    const response = await api.put<SampleProvider>(
      `/catalog/sample-providers/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/sample-providers/${id}`);
  },
};

// Evaluation Criteria
export const evaluationCriteriaService = {
  // Stages
  async getStages(): Promise<any[]> {
    const response = await api.get('/catalog/evaluation-criteria/stages');
    return response.data;
  },
  async createStage(data: any): Promise<any> {
    const response = await api.post('/catalog/evaluation-criteria/stages', data);
    return response.data;
  },
  async updateStage(id: string, data: any): Promise<any> {
    const response = await api.put(`/catalog/evaluation-criteria/stages/${id}`, data);
    return response.data;
  },
  async deleteStage(id: string): Promise<void> {
    await api.delete(`/catalog/evaluation-criteria/stages/${id}`);
  },
  // Criteria
  async getAll(stageId?: string): Promise<any[]> {
    const response = await api.get('/catalog/evaluation-criteria', { params: { stageId } });
    return response.data;
  },
  async getById(id: string): Promise<any> {
    const response = await api.get(`/catalog/evaluation-criteria/${id}`);
    return response.data;
  },
  async create(data: any): Promise<any> {
    const response = await api.post('/catalog/evaluation-criteria', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<any> {
    const response = await api.put(`/catalog/evaluation-criteria/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/evaluation-criteria/${id}`);
  },
  // Scores
  async updateScores(criteriaId: string, scores: any[]): Promise<any[]> {
    const response = await api.put(`/catalog/evaluation-criteria/${criteriaId}/scores`, { scores });
    return response.data;
  },
};

// Export Reasons
export const exportReasonsService = {
  async getAll(isActive?: boolean): Promise<any[]> {
    const response = await api.get('/catalog/export-reasons', { params: { isActive } });
    return response.data;
  },
  async getById(id: string): Promise<any> {
    const response = await api.get(`/catalog/export-reasons/${id}`);
    return response.data;
  },
  async create(data: any): Promise<any> {
    const response = await api.post('/catalog/export-reasons', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<any> {
    const response = await api.put(`/catalog/export-reasons/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/export-reasons/${id}`);
  },
};

// Category Groups
export const categoryGroupsService = {
  async getAll(isActive?: boolean): Promise<any[]> {
    const response = await api.get('/catalog/category-groups', { params: { isActive } });
    return response.data;
  },
  async getByCode(code: string): Promise<any> {
    const response = await api.get(`/catalog/category-groups/by-code/${code}`);
    return response.data;
  },
  async getById(id: string): Promise<any> {
    const response = await api.get(`/catalog/category-groups/${id}`);
    return response.data;
  },
  async create(data: any): Promise<any> {
    const response = await api.post('/catalog/category-groups', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<any> {
    const response = await api.put(`/catalog/category-groups/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/category-groups/${id}`);
  },
};

// Category Items
export const categoryItemsService = {
  async getByGroup(groupId: string, isActive?: boolean): Promise<any[]> {
    const response = await api.get('/catalog/category-items', { params: { groupId, isActive } });
    return response.data;
  },
  async getById(id: string): Promise<any> {
    const response = await api.get(`/catalog/category-items/${id}`);
    return response.data;
  },
  async create(data: any): Promise<any> {
    const response = await api.post('/catalog/category-items', data);
    return response.data;
  },
  async update(id: string, data: any): Promise<any> {
    const response = await api.put(`/catalog/category-items/${id}`, data);
    return response.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/catalog/category-items/${id}`);
  },
  async reorder(groupId: string, itemIds: string[]): Promise<void> {
    await api.put('/catalog/category-items/reorder', { groupId, itemIds });
  },
};
