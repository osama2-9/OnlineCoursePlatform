import { Delete, Edit, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useHandleComments } from "../hooks/useHandleComments";
import { API } from "../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../API/axios";

interface Comment {
  comment_id: number;
  content: string;
  author: {
    full_name: string;
    user_id: number;
  };
  created_at: string;
}

interface CommentResponse {
  success: boolean;
  comment: Comment;
  message?: string;
}

interface FetchCommentsResponse {
  comments: Comment[];
}

export const Comments = ({ articleId }: { articleId: any }) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const {
    handleDeleteComment,
    isDeleting,
    isEditing,
    handleEditComment,
    setComment,
  } = useHandleComments({
    articleId: Number(articleId),
    userId: Number(userId),
  });

  const startEditing = (commentId: number, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(content);
    setComment(content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText("");
    setComment("");
  };

  const getComments = async () => {
    try {
      const res = await axiosClient.get<FetchCommentsResponse>(
        `${API}/articels/get-article-comments/${articleId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to load comments");
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: getComments,
    staleTime: 24 * 60 * 60 * 1000,
    refetchInterval: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data?.comments) {
      const sortedComments = [...data.comments].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setComments(sortedComments);
    }
  }, [data]);

  const handleComment = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const tempId = Date.now();
    const newComment = {
      comment_id: tempId,
      content: commentText,
      author: {
        full_name: user?.full_name || "",
        user_id: Number(userId),
      },
      created_at: new Date().toISOString(),
    };

    setComments((prev) =>
      Array.isArray(prev) ? [newComment, ...prev] : [newComment]
    );
    setCommentText("");
    setShowCommentForm(false);

    try {
      const res = await axiosClient.post<CommentResponse>(
        `${API}/articels/comment`,
        { comment: commentText, articleId: articleId, userId: user?.userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data && data.success) {
        setComments((prev) =>
          prev.map((comment) =>
            comment.comment_id === tempId ? { ...data.comment } : comment
          )
        );
        toast.success("Comment added successfully");
      }
    } catch (error: any) {
      setComments((prev) =>
        prev.filter((comment) => comment.comment_id !== tempId)
      );
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    const commentToDelete = comments.find((c) => c.comment_id === commentId);
    setComments((prev) =>
      prev.filter((comment) => comment.comment_id !== commentId)
    );

    try {
      await handleDeleteComment(commentId);
    } catch (error: any) {
      if (commentToDelete) {
        setComments((prev) =>
          [...prev, commentToDelete].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
      }
      toast.error(error?.response?.data?.error || "Failed to delete comment");
    }
  };

  const handleCommentEdit = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    const originalComment = comments.find((c) => c.comment_id === commentId);
    if (!originalComment) return;

    const updatedContent = editCommentText;
    setComments((prev) =>
      prev.map((comment) =>
        comment.comment_id === commentId
          ? { ...comment, content: updatedContent }
          : comment
      )
    );

    try {
      const result = await handleEditComment(commentId);
      if (result.success) {
        setEditingCommentId(null);
        setEditCommentText("");
        setComment("");
      }
    } catch (error: any) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.comment_id === commentId ? originalComment : comment
        )
      );
      toast.error(error?.response?.data?.error || "Failed to update comment");
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <MessageCircle size={20} className="mr-2" />
          Comments ({comments.length})
        </h3>
        {isLoading && <Loader2 size={16} className="animate-spin" />}

        {showCommentForm && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Add Your Comment</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCommentForm(false)}
              >
                <X size={18} />
              </button>
            </div>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows={4}
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                onClick={handleComment}
                disabled={isSubmitting || !commentText.trim()}
                type="button"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit Comment
              </button>
            </div>
          </div>
        )}

        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment: Comment) => (
              <div
                key={comment.comment_id}
                className="border-b pb-6 last:border-0"
              >
                <div className="flex flex-center flex-reverse justify-between">
                  <div className=" flex items-center  mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                      {comment?.author?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {comment.author?.full_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {comment.created_at &&
                          new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {comment.author.user_id == user?.userId && (
                    <div className="flex items-center">
                      {isDeleting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Delete
                          size={16}
                          onClick={() =>
                            handleCommentDelete(comment.comment_id)
                          }
                          className="text-gray-500 cursor-pointer hover:text-red-700 m-2"
                        />
                      )}
                      {editingCommentId === comment.comment_id ? (
                        <X
                          size={16}
                          onClick={cancelEditing}
                          className="text-gray-500 cursor-pointer hover:text-red-700 m-2"
                        />
                      ) : (
                        <Edit
                          size={16}
                          onClick={() =>
                            startEditing(comment.comment_id, comment.content)
                          }
                          className="text-gray-500 cursor-pointer hover:text-blue-700 m-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {editingCommentId === comment.comment_id ? (
                  <div className="pl-12">
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-2"
                      rows={3}
                      value={editCommentText}
                      onChange={(e) => {
                        setEditCommentText(e.target.value);
                        setComment(e.target.value);
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                        onClick={() => handleCommentEdit(comment.comment_id)}
                        disabled={isEditing || !editCommentText.trim()}
                      >
                        {isEditing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 pl-12">{comment.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              No comments yet. Be the first to share your thoughts!
            </p>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              onClick={() => setShowCommentForm(true)}
            >
              Add Comment
            </button>
          </div>
        )}

        {comments.length > 0 && !showCommentForm && (
          <div className="mt-8 text-center">
            <button
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm mx-auto"
              onClick={() => setShowCommentForm(true)}
            >
              <MessageCircle size={18} />
              Add Comment
            </button>
          </div>
        )}
      </div>
    </>
  );
};
