import React from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import {
  Tag,
  User,
  Calendar,
  MessageCircle,
  Share2,
  Bookmark,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  Quote,
} from "lucide-react";
import { HomePageFooter } from "../components/HomePageFooter";

interface Author {
  full_name: string;
}

interface ContentBlock {
  block_id: number;
  article_id: number;
  order: number;
  block_type:
    | "HEADING"
    | "TEXT"
    | "CODE"
    | "TIP"
    | "WARNING"
    | "DIVIDER"
    | "QUOTE"
    | "IMAGE"
    | "VIDEO";
  content: string | null;
  code_language: string | null;
  code_content: string | null;
  image_url: string | null;
  image_caption: string | null;
  video_url: string | null;
  video_duration: string | null;
  quiz_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Article {
  article_id: number;
  title: string;
  excerpt: string;
  content: string;
  content_blocks: ContentBlock[];
  featured_image: string;
  author: Author;
  author_id: number;
  category: string;
  categories: string[];
  tags: string[];
  content_type: string;
  created_at: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  content: string;
  author: Author;
  created_at: string;
}

interface ArticleResponseData {
  article: Article;
}

const ContentBlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  switch (block.block_type) {
    case "HEADING":
      return <h2 className="text-2xl font-bold mt-6 mb-4">{block.content}</h2>;

    case "TEXT":
      return (
        <p className="mb-4 text-gray-700 leading-relaxed">{block.content}</p>
      );

    case "CODE":
      return (
        <div className="mb-6">
          <div className="bg-gray-800 text-gray-200 px-4 py-2 rounded-t-md flex justify-between items-center">
            <span className="text-sm font-mono">{block.code_language}</span>
            <button
              className="text-gray-400 hover:text-white"
              title="Copy code"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
          <pre className="bg-gray-900 p-4 rounded-b-md overflow-x-auto">
            <code className="text-sm font-mono text-gray-200 whitespace-pre">
              {block.code_content}
            </code>
          </pre>
        </div>
      );

    case "TIP":
      return (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 rounded-r-md">
          <div className="flex items-start">
            <Lightbulb className="text-blue-500 mt-1 mr-3 flex-shrink-0 w-5 h-5" />
            <div>
              <h4 className="font-bold text-blue-700 mb-1">Tip</h4>
              <p className="text-blue-800">{block.content}</p>
            </div>
          </div>
        </div>
      );

    case "WARNING":
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-r-md">
          <div className="flex items-start">
            <AlertTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0 w-5 h-5" />
            <div>
              <h4 className="font-bold text-yellow-700 mb-1">Warning</h4>
              <div className="text-yellow-800 whitespace-pre-line">
                {block.content}
              </div>
            </div>
          </div>
        </div>
      );

    case "DIVIDER":
      return <hr className="my-8 border-gray-200" />;

    case "QUOTE":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-6 italic text-gray-600">
          <div className="flex items-start">
            <Quote className="text-gray-400 mt-1 mr-2 flex-shrink-0 w-5 h-5" />
            <p>{block.content}</p>
          </div>
        </blockquote>
      );

    case "IMAGE":
      return (
        <figure className="my-6">
          <img
            src={block.image_url || ""}
            alt={block.image_caption || "Article image"}
            className="rounded-md w-full"
          />
          {block.image_caption && (
            <figcaption className="text-sm text-gray-500 mt-2 text-center">
              {block.image_caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return <p className="text-gray-700">{block.content}</p>;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const ArticlePage: React.FC = () => {
  const { articalId } = useParams<{ articalId: string }>();

  const getArticleContent = async (): Promise<ArticleResponseData> => {
    try {
      const res = await axios.get(`${API}/articels/get-article/${articalId}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch article");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["article", articalId],
    queryFn: getArticleContent,
    staleTime: 24 * 1000 * 60,
    refetchInterval: 24 * 1000 * 60,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!articalId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg max-w-xl text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">
            Error Loading Article
          </h2>
          <p className="text-red-600">
            There was a problem loading this article. Please try again later.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't seem to exist.
          </p>
          <button
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { article } = data;
  const {
    content_blocks,
    title,
    author,
    created_at,
    tags,
    category,
    featured_image,
  } = article;

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-sm py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => window.history.back()}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              className="text-gray-600 hover:text-blue-600 transition-colors"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              className="text-gray-600 hover:text-blue-600 transition-colors"
              title="Bookmark"
            >
              <Bookmark size={20} />
            </button>
          </div>
        </div>
      </nav>

      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
              {category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {title}
            </h1>

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center mr-6">
                <User size={16} className="mr-1" />
                <span>{author.full_name}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(created_at)}</span>
              </div>
            </div>
          </div>

          {featured_image && (
            <div className="mb-8">
              <img
                src={featured_image}
                alt={title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="prose max-w-none">
            {content_blocks.map((block) => (
              <ContentBlockRenderer key={block.block_id} block={block} />
            ))}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-12 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                <Tag size={16} className="mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <MessageCircle size={20} className="mr-2" />
            Comments ({article.comments.length})
          </h3>

          {article.comments.length > 0 ? (
            <div className="space-y-6">
              {article.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {comment.author.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {comment.author.full_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No comments yet. Be the first to share your thoughts!
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Add Comment
              </button>
            </div>
          )}
        </div>
      </main>

      <div>
        <HomePageFooter />
      </div>
    </div>
  );
};

export default ArticlePage;
