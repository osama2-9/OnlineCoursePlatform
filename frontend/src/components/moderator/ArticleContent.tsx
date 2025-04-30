import { CheckCircle, XCircle } from "lucide-react";
import { Article } from "../../types/ModerationDashboardTypes";

interface ArticleContentProps {
  article: Article;
  handleApprove: (id: number) => void;
  handleReject: (id: number) => void;
  isApproveLoading: boolean;
  setModerationNote: (note: string) => void;
  moderationNote: string;
  isRejectLoading: boolean;
}
const ArticleContent = ({
  article,
  handleApprove,
  isApproveLoading,
  handleReject,
  moderationNote,
  setModerationNote,
  isRejectLoading,
}: ArticleContentProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{article.title}</h2>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <span className="capitalize mr-2">{article.type}</span>
            <span>•</span>
            <span className="mx-2">{article.tags || "No tags"}</span>
            <span>•</span>
            <span className="ml-2">By {article.author_name}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          {article.status === "pending" && (
            <>
              <button
                onClick={() => handleReject(article.article_id)}
                disabled={isRejectLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(article.article_id)}
                disabled={isApproveLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isApproveLoading ? "Approving..." : "Approve"}
              </button>
            </>
          )}
          {article.status === "approved" && (
            <div className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span>
                Approved on{" "}
                {typeof article.created_at === "string"
                  ? article.created_at
                  : article.created_at.toLocaleDateString()}
              </span>
            </div>
          )}
          {article.status === "rejected" && (
            <div className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-1" />
              <span>
                Rejected on{" "}
                {typeof article.created_at === "string"
                  ? article.created_at
                  : article.created_at.toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700">Article Preview</h3>
          <div className="mt-2 text-sm text-gray-500">
            <p>{article.excerpt}</p>
          </div>
        </div>

        {article.content && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700">Content</h3>
            <div className="mt-2 prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>
        )}

        {article.content_blocks && article.content_blocks.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-sm font-medium text-gray-700">
              Content Blocks
            </h3>
            <div className="mt-2 space-y-4">
              {article.content_blocks.map((block, index) => (
                <div key={index} className="border border-gray-200 rounded p-3">
                  {block.content && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">{block.content}</p>
                    </div>
                  )}
                  {block.image_url && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Image URL:</p>
                      <p className="text-sm text-blue-600">{block.image_url}</p>
                      {block.image_caption && (
                        <p className="text-xs text-gray-500 italic mt-1">
                          Caption: {block.image_caption}
                        </p>
                      )}
                    </div>
                  )}
                  {block.video_url && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400">Video URL:</p>
                      <p className="text-sm text-blue-600">{block.video_url}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700">SEO Metadata</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">SEO Title</p>
              <p className="font-medium text-gray-900">
                {article.seo_title || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">SEO Description</p>
              <p className="font-medium text-gray-900">
                {article.seo_description || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Featured Image</p>
              <p className="font-medium text-gray-900">
                {article.featured_image ? "Provided" : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Tags</p>
              <p className="font-medium text-gray-900">
                {article.tags || "None"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700">Metadata</h3>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">ID</p>
              <p className="font-medium text-gray-900">{article.article_id}</p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {article.type}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Author</p>
              <p className="font-medium text-gray-900">{article.author_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">
                {typeof article.created_at === "string"
                  ? article.created_at
                  : article.created_at.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p
                className={`font-medium capitalize ${
                  article.status === "pending"
                    ? "text-yellow-700"
                    : article.status === "approved"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {article.status}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700">
            Moderation Notes
          </h3>
          <textarea
            className="mt-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={4}
            placeholder="Add moderation notes here (optional)"
            value={moderationNote}
            onChange={(e) => setModerationNote(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ArticleContent;
