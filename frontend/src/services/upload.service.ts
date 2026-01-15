import api from '@/lib/api';

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;

    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Otherwise, prepend the API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `${apiUrl}${path}`;
  },
};
