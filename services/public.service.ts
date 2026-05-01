import axios from 'axios';
import { appConfig } from '@/lib/config';

const API_URL = appConfig.serverApiBaseUrl;

export const publicService = {
  getAboutUs: async () => {
    const response = await axios.get(`${API_URL}/public/aboutus/`);
    return response.data;
  },

  getBlogs: async () => {
    const response = await axios.get(`${API_URL}/public/blogs/`);
    return response.data;
  },

  getBlogDetail: async (slug: string) => {
    const response = await axios.get(`${API_URL}/public/blogs/${slug}/`);
    return response.data;
  },

  getCareers: async () => {
    const response = await axios.get(`${API_URL}/public/careers/`);
    return response.data;
  },

  submitContactInquiry: async (data: { full_name: string; email: string; subject: string; message: string }) => {
    const response = await axios.post(`${API_URL}/public/contactus/`, data);
    return response.data;
  }
};
