import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const publicService = {
  getAboutUs: async () => {
    const response = await axios.get(`${API_URL}/publicpages/aboutus/`);
    return response.data;
  },
  
  getBlogs: async () => {
    const response = await axios.get(`${API_URL}/publicpages/blogs/`);
    return response.data;
  },
  
  getBlogDetail: async (slug: string) => {
    const response = await axios.get(`${API_URL}/publicpages/blogs/${slug}/`);
    return response.data;
  },
  
  getCareers: async () => {
    const response = await axios.get(`${API_URL}/publicpages/careers/`);
    return response.data;
  },
  
  submitContactInquiry: async (data: { full_name: string; email: string; subject: string; message: string }) => {
    const response = await axios.post(`${API_URL}/publicpages/contactus/`, data);
    return response.data;
  }
};
