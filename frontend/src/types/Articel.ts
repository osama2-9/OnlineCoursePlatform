export interface Article {
    title: string;
    slug: string;
    excerpt: string;
    status: string;
    content_type: string;
    category: Category;
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
    block_type: string;
    order: number;
    content?: string | null;
    code_language?: string | null;
    code_content?: string | null;
    image_url?: string | null;
    image_caption?: string | null;
}

export const contentStatusOptions = ["draft", "published", "archived", "deleted"];
export const articleTypeOptions = [
    "tutorial",
    "howto",
    "explainer",
    "news",
    "opinion",
    "reference",
];
export const blockTypeOptions = [
    "TEXT",
    "CODE",
    "IMAGE",
    "WARNING",
    "TIP",
    "QUOTE",
    "HEADING",
    "DIVIDER",
];