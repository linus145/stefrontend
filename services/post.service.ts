import { api } from '@/lib/api';
import { Post, PostCreateData } from '@/types/post.types';
import { PaginatedResponse } from '@/types/auth.types';

export const postService = {
  getPosts: (page: number = 1): Promise<PaginatedResponse<Post>> => {
    return api.get<PaginatedResponse<Post>>(`/posts/?page=${page}`);
  },

  getUserPosts: (userId: string, page: number = 1): Promise<PaginatedResponse<Post>> => {
    return api.get<PaginatedResponse<Post>>(`/posts/user/${userId}/?page=${page}`);
  },

  createPost: (data: PostCreateData): Promise<Post> => {
    return api.post<Post>('/posts/create/', data);
  },

  getPost: (postId: string): Promise<Post> => {
    return api.get<Post>(`/posts/${postId}/`);
  },

  deletePost: (postId: string): Promise<void> => {
    return api.delete(`/posts/${postId}/`);
  },

  toggleLike: (postId: string): Promise<{ detail: string; likes_count: number }> => {
    return api.post<{ detail: string; likes_count: number }>('/interactions/likes/toggle/', { post_id: postId });
  },

  toggleDislike: (postId: string): Promise<{ detail: string; dislikes_count: number }> => {
    return api.post<{ detail: string; dislikes_count: number }>('/interactions/dislikes/toggle/', { post_id: postId });
  },

  getImageKitAuth: (): Promise<{ token: string; expire: number; signature: string }> => {
    return api.get<{ token: string; expire: number; signature: string }>('/posts/imagekit-auth/');
  },


  getComments: (postId: string): Promise<any[]> => {
    return api.get<PaginatedResponse<any>>(`/interactions/comments/?post_id=${postId}`)
      .then(res => res.results || []);
  },

  createComment: (postId: string, content: string): Promise<any> => {
    return api.post('/interactions/comments/', { post: postId, content });
  }
};
