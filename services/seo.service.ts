import axios from 'axios';
import { appConfig } from '@/lib/config';

const API_URL = appConfig.serverApiBaseUrl;

export interface PageSEOResponse {
  name: string;
  url_path: string;
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords?: string | null;
    og_title?: string | null;
    og_description?: string | null;
    og_image?: string | null;
    og_type?: string | null;
  } | null;
}

export const seoService = {
  getPageSEO: async (path: string): Promise<PageSEOResponse> => {
    const response = await axios.get(`${API_URL}/seo/`, {
      params: { path }
    });
    return response.data;
  }
};
