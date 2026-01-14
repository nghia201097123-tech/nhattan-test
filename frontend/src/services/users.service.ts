import api from '@/lib/api';
import { User, Role, Permission, PaginatedResult, PaginationParams } from '@/types';

export const usersService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResult<User>> {
    const response = await api.get<PaginatedResult<User>>('/users', { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: {
    username: string;
    email: string;
    password?: string;
    fullName: string;
    phone?: string;
  }): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async update(id: string, data: {
    email?: string;
    fullName?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    const response = await api.put<User>(`/users/${id}/roles`, { roleIds });
    return response.data;
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.put(`/users/${id}/reset-password`, { newPassword });
  },

  async toggleStatus(id: string, isActive: boolean): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, { isActive });
    return response.data;
  },
};

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const response = await api.get<Role[]>('/users/roles/all');
    return response.data;
  },

  async getPermissions(): Promise<Permission[]> {
    const response = await api.get<Permission[]>('/users/permissions/all');
    return response.data;
  },
};
