import React from 'react';
import { X } from "lucide-react";
import toast from "react-hot-toast";

import axiosClient from '../../API/axios';

interface AssignmentDeleteModalProps {
  assignment_id: number;
  course_id: number;
  instructor_id: number;
  isOpen: boolean;
  onClose: () => void;
}

const AssignmentDeleteModal: React.FC<AssignmentDeleteModalProps> = ({ 
  assignment_id, 
  course_id, 
  instructor_id, 
  isOpen, 
  onClose 
}) => {
  const handleConfirmDelete = async () => {
    try {
      const res = await axiosClient.delete(`/assignments/delete-assignment/${assignment_id}`, {
        params: {
          course_id,
          instructor_id
        },
       
      });

      const data = await res.data;
      if (data.message) {
        toast.success(data.message);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || 'Failed to delete assignment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
      <div className="relative max-w-lg bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <button 
            className="absolute top-2 right-2 bg-gray-300 rounded-full p-2 hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          
          <h3 className="text-lg font-semibold mb-2">Delete Assignment</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete this assignment? This action cannot be undone.
          </p>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete} 
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDeleteModal;