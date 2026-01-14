import api from '@/lib/api';
import {
  WarehouseReceipt,
  WarehouseExport,
  InventoryTransaction,
  StockSummary,
  PaginatedResult,
  PaginationParams,
  ExportStatus,
} from '@/types';

export const receiptsService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<WarehouseReceipt>> {
    const response = await api.get<PaginatedResult<WarehouseReceipt>>(
      '/warehouse/receipts',
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<WarehouseReceipt> {
    const response = await api.get<WarehouseReceipt>(`/warehouse/receipts/${id}`);
    return response.data;
  },

  async generateCode(): Promise<{ code: string }> {
    const response = await api.get<{ code: string }>('/warehouse/receipts/generate-code');
    return response.data;
  },

  async create(data: Partial<WarehouseReceipt>): Promise<WarehouseReceipt> {
    const response = await api.post<WarehouseReceipt>('/warehouse/receipts', data);
    return response.data;
  },

  async update(id: string, data: Partial<WarehouseReceipt>): Promise<WarehouseReceipt> {
    const response = await api.put<WarehouseReceipt>(`/warehouse/receipts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/warehouse/receipts/${id}`);
  },
};

export const exportsService = {
  async getAll(
    params?: PaginationParams & { status?: ExportStatus }
  ): Promise<PaginatedResult<WarehouseExport>> {
    const response = await api.get<PaginatedResult<WarehouseExport>>(
      '/warehouse/exports',
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<WarehouseExport> {
    const response = await api.get<WarehouseExport>(`/warehouse/exports/${id}`);
    return response.data;
  },

  async generateCode(): Promise<{ code: string }> {
    const response = await api.get<{ code: string }>('/warehouse/exports/generate-code');
    return response.data;
  },

  async create(data: Partial<WarehouseExport>): Promise<WarehouseExport> {
    const response = await api.post<WarehouseExport>('/warehouse/exports', data);
    return response.data;
  },

  async update(id: string, data: Partial<WarehouseExport>): Promise<WarehouseExport> {
    const response = await api.put<WarehouseExport>(`/warehouse/exports/${id}`, data);
    return response.data;
  },

  async submit(id: string): Promise<WarehouseExport> {
    const response = await api.post<WarehouseExport>(`/warehouse/exports/${id}/submit`);
    return response.data;
  },

  async approve(id: string, notes?: string): Promise<WarehouseExport> {
    const response = await api.post<WarehouseExport>(`/warehouse/exports/${id}/approve`, {
      notes,
    });
    return response.data;
  },

  async reject(id: string, reason?: string): Promise<WarehouseExport> {
    const response = await api.post<WarehouseExport>(`/warehouse/exports/${id}/reject`, {
      rejectReason: reason,
    });
    return response.data;
  },

  async execute(id: string): Promise<WarehouseExport> {
    const response = await api.post<WarehouseExport>(`/warehouse/exports/${id}/execute`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/warehouse/exports/${id}`);
  },
};

export const inventoryService = {
  async getAll(
    params?: PaginationParams & {
      warehouseId?: string;
      sampleId?: string;
      transactionType?: 'IN' | 'OUT';
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<PaginatedResult<InventoryTransaction>> {
    const response = await api.get<PaginatedResult<InventoryTransaction>>(
      '/warehouse/inventory',
      { params }
    );
    return response.data;
  },

  async getStockBySample(sampleId: string): Promise<StockSummary[]> {
    const response = await api.get<StockSummary[]>(
      `/warehouse/inventory/sample/${sampleId}`
    );
    return response.data;
  },

  async getStockByWarehouse(warehouseId: string): Promise<StockSummary[]> {
    const response = await api.get<StockSummary[]>(
      `/warehouse/inventory/warehouse/${warehouseId}`
    );
    return response.data;
  },

  async getStockCard(
    sampleId: string,
    warehouseId?: string
  ): Promise<(InventoryTransaction & { balance: number })[]> {
    const response = await api.get<(InventoryTransaction & { balance: number })[]>(
      `/warehouse/inventory/stock-card/${sampleId}`,
      { params: { warehouseId } }
    );
    return response.data;
  },
};
