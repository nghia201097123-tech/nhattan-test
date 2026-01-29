import api from '@/lib/api';
import {
  Sample,
  SampleEvaluation,
  PaginatedResult,
  PaginationParams,
  PropagationBatch,
  SeedCardConfig,
  SeedCardData,
} from '@/types';

export const samplesService = {
  async getAll(params?: PaginationParams & { warehouseId?: string; categoryId?: string; status?: string }): Promise<PaginatedResult<Sample>> {
    const response = await api.get<PaginatedResult<Sample>>('/samples', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<Sample> {
    const response = await api.get<Sample>(`/samples/${id}`);
    return response.data;
  },

  async generateCode(): Promise<{ code: string }> {
    const response = await api.get<{ code: string }>('/samples/generate-code');
    return response.data;
  },

  async create(data: Partial<Sample>): Promise<Sample> {
    const response = await api.post<Sample>('/samples', data);
    return response.data;
  },

  async update(id: string, data: Partial<Sample>): Promise<Sample> {
    const response = await api.put<Sample>(`/samples/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/samples/${id}`);
  },

  async getHistory(id: string): Promise<Sample[]> {
    const response = await api.get<Sample[]>(`/samples/${id}/history`);
    return response.data;
  },

  async getEvaluations(id: string): Promise<SampleEvaluation[]> {
    const response = await api.get<SampleEvaluation[]>(`/samples/${id}/evaluations`);
    return response.data;
  },
};

export const evaluationsService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<SampleEvaluation>> {
    const response = await api.get<PaginatedResult<SampleEvaluation>>('/evaluations', {
      params,
    });
    return response.data;
  },

  async getPending(): Promise<Sample[]> {
    const response = await api.get<Sample[]>('/evaluations/pending');
    return response.data;
  },

  async getById(id: string): Promise<SampleEvaluation> {
    const response = await api.get<SampleEvaluation>(`/evaluations/${id}`);
    return response.data;
  },

  async create(data: Partial<SampleEvaluation>): Promise<SampleEvaluation> {
    const response = await api.post<SampleEvaluation>('/evaluations', data);
    return response.data;
  },

  async update(id: string, data: Partial<SampleEvaluation>): Promise<SampleEvaluation> {
    const response = await api.put<SampleEvaluation>(`/evaluations/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },
};

// Propagation Service
export interface PropagationFilterParams extends PaginationParams {
  sampleId?: string;
  propagatorId?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export const propagationService = {
  async getAll(params?: PropagationFilterParams): Promise<PaginatedResult<PropagationBatch>> {
    const response = await api.get<PaginatedResult<PropagationBatch>>('/samples/propagation', {
      params,
    });
    return response.data;
  },

  async getById(id: string): Promise<PropagationBatch> {
    const response = await api.get<PropagationBatch>(`/samples/propagation/${id}`);
    return response.data;
  },

  async getBySampleId(sampleId: string): Promise<PropagationBatch[]> {
    const response = await api.get<PropagationBatch[]>(`/samples/propagation/by-sample/${sampleId}`);
    return response.data;
  },

  async getStatistics(): Promise<any> {
    const response = await api.get('/samples/propagation/statistics');
    return response.data;
  },

  async create(data: Partial<PropagationBatch>): Promise<PropagationBatch> {
    const response = await api.post<PropagationBatch>('/samples/propagation', data);
    return response.data;
  },

  async update(id: string, data: Partial<PropagationBatch>): Promise<PropagationBatch> {
    const response = await api.put<PropagationBatch>(`/samples/propagation/${id}`, data);
    return response.data;
  },

  async updateProgress(id: string, data: { progress: number; status?: string; notes?: string }): Promise<PropagationBatch> {
    const response = await api.patch<PropagationBatch>(`/samples/propagation/${id}/progress`, data);
    return response.data;
  },

  async recordHarvest(id: string, data: {
    harvestDate: string;
    harvestQuantity: number;
    harvestUnit?: string;
    qualityRating?: string;
    resultWarehouseId?: string;
    resultLocationId?: string;
    harvestNotes?: string;
  }): Promise<PropagationBatch> {
    const response = await api.post<PropagationBatch>(`/samples/propagation/${id}/harvest`, data);
    return response.data;
  },

  async complete(id: string): Promise<PropagationBatch> {
    const response = await api.patch<PropagationBatch>(`/samples/propagation/${id}/complete`);
    return response.data;
  },

  async cancel(id: string): Promise<PropagationBatch> {
    const response = await api.patch<PropagationBatch>(`/samples/propagation/${id}/cancel`);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/samples/propagation/${id}`);
  },
};

// Seed Card Service
export const seedCardService = {
  async getSamplesForPrint(params?: {
    search?: string;
    categoryId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<SeedCardData>> {
    const response = await api.get<PaginatedResult<SeedCardData>>('/samples/seed-card/samples', {
      params,
    });
    return response.data;
  },

  async getDefaultConfig(): Promise<SeedCardConfig> {
    const response = await api.get<SeedCardConfig>('/samples/seed-card/config/default');
    return response.data;
  },

  async getCardPreview(sampleId: string, config?: SeedCardConfig): Promise<{
    data: SeedCardData;
    config: SeedCardConfig;
  }> {
    const response = await api.get(`/samples/seed-card/preview/${sampleId}`, {
      params: config,
    });
    return response.data;
  },

  async getCardsPreview(sampleIds: string[], config?: SeedCardConfig): Promise<{
    data: SeedCardData[];
    config: SeedCardConfig;
  }> {
    const response = await api.post('/samples/seed-card/preview/batch', {
      sampleIds,
      config,
    });
    return response.data;
  },

  async getCardData(sampleId: string): Promise<SeedCardData> {
    const response = await api.get<SeedCardData>(`/samples/seed-card/data/${sampleId}`);
    return response.data;
  },

  async getCardsData(sampleIds: string[]): Promise<SeedCardData[]> {
    const response = await api.post<SeedCardData[]>('/samples/seed-card/data/batch', {
      sampleIds,
    });
    return response.data;
  },

  async getQRCodeData(sampleId: string): Promise<{ qrData: string }> {
    const response = await api.get<{ qrData: string }>(`/samples/seed-card/qr-code/${sampleId}`);
    return response.data;
  },

  async generateCard(sampleId: string, config?: SeedCardConfig): Promise<{
    data: SeedCardData;
    config: SeedCardConfig;
  }> {
    const response = await api.post('/samples/seed-card/generate', {
      sampleId,
      config,
    });
    return response.data;
  },

  async generateBatchCards(sampleIds: string[], config?: SeedCardConfig): Promise<{
    data: SeedCardData[];
    config: SeedCardConfig;
  }> {
    const response = await api.post('/samples/seed-card/generate/batch', {
      sampleIds,
      config,
    });
    return response.data;
  },
};
