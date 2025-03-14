import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Share2, Calendar, Clock, User, ThumbsUp, MessageSquare } from 'lucide-react';
import { Article } from '../types/Article';

interface ArticleCardProps {
  article: Article;
  onShare: (articleId: number) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onShare }) => {
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Link to={`/articels/read/${article.article_id}`}>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="h-52 overflow-hidden relative">
          <img
            src={article.featured_image || "/api/placeholder/600/300"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-3 right-3 flex space-x-2">
            <button className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm">
              <Bookmark className="h-4 w-4 text-blue-700" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onShare(article.article_id);
              }}
              className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors duration-200 shadow-sm"
            >
              <Share2 className="h-4 w-4 text-blue-700" />
            </button>
          </div>

          <div className="absolute top-3 left-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
              {article.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{calculateReadTime(article.content)} min read</span>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors duration-200">
            {article.title}
          </h2>

          <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>

          <div className="mb-5 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                +{article.tags.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mr-2 text-blue-700">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">{article.author.full_name}</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                <ThumbsUp className="h-4 w-4" />
                {article.likes_count}
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                <MessageSquare className="h-4 w-4" />
                {article.comments_count}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
