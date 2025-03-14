export interface Article {
  article_id: number;
  categories: any[];
  category: string;
  content_blocks: ContentBlock[];
  excerpt: string;
  featured_image: string;
  content_type: string;
  content: string;
  author: {
    full_name: string;
  };
  tags: string[];
  title: string;
  author_id: number;
  created_at: string;
  comments_count: number;
  likes_count: number;
  slug?: string;
  status?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
}

export interface ContentBlock {
  block_id: number;
  article_id: number;
  order: number;
  block_type: string;
  content: string | null;
  code_language: string | null;
  code_content: string | null;
  image_url: string | null;
  image_caption: string | null;
  video_url: string | null;
}

export type ContentStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type ArticleType = 'tutorial' | 'howto' | 'explainer' | 'news' | 'opinion' | 'reference';
export type BlockType = 'TEXT' | 'CODE' | 'IMAGE' | 'WARNING' | 'TIP' | 'QUOTE' | 'HEADING' | 'DIVIDER';

export const contentStatusOptions: ContentStatus[] = ['draft', 'published', 'archived', 'deleted'];
export const articleTypeOptions: ArticleType[] = ['tutorial', 'howto', 'explainer', 'news', 'opinion', 'reference'];
export const blockTypeOptions: BlockType[] = ['TEXT', 'CODE', 'IMAGE', 'WARNING', 'TIP', 'QUOTE', 'HEADING', 'DIVIDER'];