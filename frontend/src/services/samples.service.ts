import api from '@/lib/api';
import {
  Sample,
  SampleEvaluation,
  PaginatedResult,
  PaginationParams,
} from '@/types';

export const samplesService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<Sample>> {
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
