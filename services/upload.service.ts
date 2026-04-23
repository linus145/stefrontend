import { axiosInstance } from '@/lib/axios';

export interface UploadResponse {
  image_url: string;
  file_id: string;
  file_name: string;
}

/**
 * Server-side image upload service.
 * Uploads files to the Django backend which proxies to ImageKit CDN.
 * No frontend ImageKit SDK required.
 */
export const uploadService = {
  /**
   * Upload a file to ImageKit via the Django backend.
   * @param file - The File object to upload
   * @param folder - Target folder in ImageKit (e.g. "/posts", "/profiles")
   * @returns Promise resolving to UploadResponse with the CDN URL
   */
  uploadImage: async (file: File, folder: string = '/uploads'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axiosInstance.post<UploadResponse>('/upload/image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
