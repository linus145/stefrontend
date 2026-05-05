import { api } from '@/lib/api';
import { PaginatedResponse } from '@/types/auth.types';

export interface News {
  id: string;
  author_id: string;
  author_email: string;
  author_first_name: string;
  author_last_name: string;
  author_image_url?: string;
  title: string;
  content: string;
  media_url?: string;
  is_popular: boolean;
  is_trending: boolean;
  is_top_news: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsCreateData {
  title: string;
  content: string;
  media_url?: string;
}

export const newsService = {
  getNews: (page: number = 1, category?: string): Promise<PaginatedResponse<News>> => {
    const query = category ? `&category=${category}` : '';
    return api.get<PaginatedResponse<News>>(`/news/?page=${page}${query}`);
  },

  createNews: (data: NewsCreateData): Promise<News> => {
    return api.post<News>('/news/create/', data);
  },

  getNewsDetail: (id: string): Promise<News> => {
    return api.get<News>(`/news/${id}/`);
  }
};
