export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  status: ContentStatus;
  content_type: ArticleType;
  category?: string; 
  categories: Category[];
  tags: string[];
  featured_image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  content_blocks: ContentBlock[];
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
}

export interface ContentBlock {
  id: number;
  block_type: BlockType;
  content?: string;
  code_language?: string;
  code_content?: string;
  image_url?: string;
  image_caption?: string;
  order: number;
}

export type ContentStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type ArticleType = 'tutorial' | 'howto' | 'explainer' | 'news' | 'opinion' | 'reference';
export type BlockType = 'TEXT' | 'CODE' | 'IMAGE' | 'WARNING' | 'TIP' | 'QUOTE' | 'HEADING' | 'DIVIDER';

export const contentStatusOptions: ContentStatus[] = ['draft', 'published', 'archived', 'deleted'];
export const articleTypeOptions: ArticleType[] = ['tutorial', 'howto', 'explainer', 'news', 'opinion', 'reference'];
export const blockTypeOptions: BlockType[] = ['TEXT', 'CODE', 'IMAGE', 'WARNING', 'TIP', 'QUOTE', 'HEADING', 'DIVIDER'];