
interface ArticleApprovalRequest {
    article_id: number;
    article_approvel_id: number;
    article: {
        title: string;
        excerpt: string;
    };
    type: 'article';
    author_name: string;
    status?: string;
}

interface LessonApprovalRequest {
    lesson_id: number;
    lessoon_approvel_id: number;
    lesson: {
        title: string;
        description: string;
    };
    type: 'lesson';
    author_name: string;
    status?: string;
}

interface Content {
    contentId: number,
    content_approbvel_Id: number,
    title: string,
    description: string,
    author_name: string,
    created_at: Date,
    type: "lesson" | "article"
    status: string,
}

interface FetchContentResponse {
    requests: Content[];
}



interface Article {
    article_id: number;
    title: string;
    excerpt: string;
    seo_description: string;
    featured_image: string;
    seo_title: string;
    tags: string;
    created_at: Date;
    content: string;
    author_name: string;
    status: string;
    content_blocks: {
        content: string;
        image_url: string;
        image_caption: string;
        video_url: string;
    }[];
    type: 'article';
    article_approvel_id: number;
}


interface Lesson {
    lesson_id?: number;
    title: string;
    description: string;
    content?: string;
    attachment?: string;
    video_url?: string;
    created_at: Date;
    author_name: string;
    status: string;
    type: 'lesson';
    lesson_approvel_id: number;
}

export type { Article, Lesson, ArticleApprovalRequest, LessonApprovalRequest, FetchContentResponse  , Content };