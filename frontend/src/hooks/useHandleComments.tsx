import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { API } from "../API/ApiBaseUrl";
interface CommentProps{
    articleId: number;
    userId: number;
}
export const useHandleComments = ({articleId, userId}: CommentProps) => {
const [isDeleting, setIsDeleting] = useState<boolean>(false);
const [isEditing, setIsEditing] = useState<boolean>(false);
const [comment, setComment] = useState<string>("")

const handleDeleteComment = async (comment_id:number)=>{
try {
    setIsDeleting(true)
    const res =await axios.delete(`${API}/articels/delete-comment/${articleId}/${comment_id}/${userId}` ,{
        headers:{
            "Content-Type":"application/json"
        },
        withCredentials:true
    })
const data =await res.data
if(data && data.success){
    toast.success(data.message||"Comment deleted successfully")
}
} catch (error:any) {
    console.log(error);
    toast.error(error?.response?.data?.error)
    
    
}finally{
    setIsDeleting(false)
}

}

const handleEditComment = async(comment_id:number)=>{
    setIsEditing(true)
    try {
        const res =await axios.put(`${API}/articels/edit-comment` ,{
            userId: userId,
            articalId: articleId,
            commentId: comment_id,
            comment:comment
        } ,{
            headers:{
                "Content-Type":"application/json"
            },
            withCredentials:true
        })

        const data = await res.data
        if(data && data.success){
            toast.success(data.message || "Comment edited successfully")
        }
    } catch (error:any) {
        console.log(error);
        toast.error(error?.response?.data?.error)
        
        
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