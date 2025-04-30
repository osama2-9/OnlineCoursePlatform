import axios from "axios";
import { useParams } from "react-router-dom";
import { API } from "../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import {
  Tag,
  Calendar,
  Share2,
  Bookmark,
  AlertTriangle,
  ChevronLeft,
  ThumbsUp,
  Eye,
  Loader2,
} from "lucide-react";

import { HomePageFooter } from "../components/HomePageFooter";
import { ContentBlock } from "../components/ContentBlock";
import { Likes } from "../hooks/Likes";
import { useAuth } from "../hooks/useAuth";
import { useBookmark } from "../hooks/Bookmark";
import toast from "react-hot-toast";


interface Author {
  full_name: string;
  user_id:number
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
  created_at: Date;
  read_time?: number;
  views?: number;
}


interface ArticleResponseData {
  article: Article;
  allowLike?: boolean;
  likes_count?: number;
  isBookmarked?: boolean;

}


export const ArticlePage: React.FC = () => {
  const { user } = useAuth();
  const { articalId } = useParams<{ articalId: string }>();
  let requestEndpoint = `${API}/articels/get-article/${articalId}/u/${user?.userId}`;
  if(!user){
    requestEndpoint = `${API}/articels/get-article/${articalId}/u/undefined`;
  }else{
    requestEndpoint = `${API}/articels/get-article/${articalId}/u/${user?.userId}`;
  }
  const copyArticleUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Article URL copied to clipboard");
  }
  const getArticleContent = async (): Promise<ArticleResponseData> => {
    try {
      const res = await axios.get(`${requestEndpoint}`, {
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
  const { handleClickLike, handleClickUnlike, addLikeSuccess, removeLikeSuccess } = Likes(articalId, user?.userId);
  const {addBookmarkSuccess, removeBookmarkSuccess, addBookmark, removeBookmark} = useBookmark(articalId ,user?.userId);
  let likes = data?.likes_count || 0
  let allowLike = data && data.allowLike ? data?.allowLike : false;
  if(addLikeSuccess){
    likes++;
    allowLike = false
  }
  if(removeLikeSuccess){
    likes--;
    allowLike = true;
  }

  let isBookmarked = data && data.isBookmarked ? data?.isBookmarked : false;
  if(addBookmarkSuccess){
    isBookmarked = true
  }
  if(removeBookmarkSuccess){
    isBookmarked = false
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="flex items-center text-center justify-center">
            <Loader2 className="animate-spin" color="#2563eb " size={25} />
          </div>
          <p className="mt-4 text-gray-600 text-center">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg max-w-xl text-center shadow-lg border border-red-100">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Article
          </h2>
          <p className="text-gray-600 mb-6">
            There was a problem loading this article. Please try again later.
          </p>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't seem to exist.
          </p>
          <button
            className="flex items-center gap-2 mx-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

  const readTime = article.read_time || 5;
  const views = article.views || Math.floor(Math.random() * 1000) + 100;

  let handleLikeRequest = allowLike ? handleClickLike : handleClickUnlike;
  let handleBookmarkRequest = isBookmarked ? removeBookmark : addBookmark;

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
            onClick={() => window.location.replace('/articels')}
          >
            <ChevronLeft size={20} />
            <span>Back to Articles</span>
          </button>

          <div className="flex items-center gap-5">
            <button
            onClick={copyArticleUrl}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
            onClick={handleBookmarkRequest}
              className={`text-gray-600 hover:text-blue-600 transition-colors ${ isBookmarked? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}`}
              title="Bookmark"
            >
              <Bookmark size={20} />
            </button>
            <button
            onClick={handleLikeRequest}
              className={`flex items-center gap-1 transition-colors ${
                !allowLike ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
              title={allowLike ? "Like" : "Unlike"}
              disabled={!user}
            >
              <ThumbsUp size={18} />
              <span className="text-sm font-medium">{likes}</span>
            </button>
          </div>
        </div>
      </nav>

      <header className="bg-gradient-to-b from-blue-50 to-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4 shadow-sm">
              {category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-y-2">
              <div className="flex items-center mr-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2">
                  {author.full_name.charAt(0)}
                </div>
                <span className="font-medium">{author.full_name}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar size={16} className="mr-1 text-gray-500" />
                <span>{created_at && new Date(created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mr-6">
                <Clock size={16} className="mr-1 text-gray-500" />
                <span>{readTime} min read</span>
              </div>
              <div className="flex items-center">
                <Eye size={16} className="mr-1 text-gray-500" />
                <span>{views} views</span>
              </div>
            </div>
          </div>

          {featured_image && (
            <div className="mb-8">
              <img
                src={featured_image}
                alt={title}
                className="w-full h-64 md:h-96 rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-8">
              <div className="prose max-w-none">
                {content_blocks.map((block) => (
                  <ContentBlock key={block.block_id} block={block} />
                ))}
              </div>

              {tags && tags.length > 0 && (
                <div className="mt-12 pt-6 border-t">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center">
                    <Tag size={16} className="mr-2" />
                    Related Topics
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

           
          </div>

          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Author</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                    {author.full_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{author.full_name}</h4>
                    <p className="text-sm text-gray-500">Technical Writer</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {content_blocks
                    .filter((block) => block.block_type === "HEADING")
                    .map((heading, index) => (
                      <a
                        key={index}
                        href={`#H-${heading.content}`}
                        className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {heading.content}
                      </a>
                    ))}
                </nav>
              </div>

            </div>
          </div>
        </div>
      </main>

      <HomePageFooter />
    </div>
  );
};

const Clock: React.FC<{ size: number; className?: string }> = ({
  size,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};

export default ArticlePage;
