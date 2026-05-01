export interface Post {
  id: string;
  author_id: string;
  author_email: string;
  author_first_name: string;
  author_role: 'ADMIN' | 'FOUNDER' | 'INVESTOR';
  author_image_url?: string;
  author_linkedin_url?: string;
  content: string;
  media_url?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCreateData {
  content: string;
  media_url?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}
