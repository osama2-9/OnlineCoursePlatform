import { useState } from "react";
import toast from "react-hot-toast";
import axiosClient from "../API/axios";

interface CommentProps {
    articleId: number;
    userId: number;
}

interface EditCommentResponse {
    success: boolean;
    message?: string;
}

interface DeleteCommentResponse {
    success: boolean;
    message?: string;
}

export const useHandleComments = ({articleId, userId}: CommentProps) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [comment, setComment] = useState<string>("")

    const handleDeleteComment = async (comment_id:number): Promise<DeleteCommentResponse> => {
        try {
            setIsDeleting(true)
            const res = await axiosClient.delete(`/articels/delete-comment/${articleId}/${comment_id}/${userId}`, {
                headers:{
                    "Content-Type":"application/json"
                },
                withCredentials:true
            })
            const data = await res.data
            if(data && data.success){
                toast.success(data.message||"Comment deleted successfully")
            }
            return data;
        } catch (error:any) {
            console.log(error);
            toast.error(error?.response?.data?.error)
            throw error;
        }finally{
            setIsDeleting(false)
        }
    }

    const handleEditComment = async(comment_id:number): Promise<EditCommentResponse> => {
        setIsEditing(true)
        try {
            const res = await axiosClient.put<EditCommentResponse>(`/articels/edit-comment` ,{
                userId: userId,
                articalId: articleId,
                commentId: comment_id,
                comment: comment
            } ,{
                headers:{
                    "Content-Type":"application/json"
                },
                withCredentials:true
            })

            const data = res.data;
            if(data && data.success){
                toast.success(data.message || "Comment edited successfully")
            }
            return data;
        } catch (error:any) {
            console.log(error);
            toast.error(error?.response?.data?.error)
            throw error;
        }finally{
            setIsEditing(false)
        }
    }
    return {
        handleDeleteComment,
        isDeleting,
        isEditing,
        handleEditComment,
        setComment
    }
}