import React, { useState, useEffect, FormEvent } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { Assignment } from "../../types/Assignment";
import axiosClient from "../../API/axios";

interface UpdateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment;
}

const UpdateAssignmentModal = ({
  isOpen,
  onClose,
  assignment,
}: UpdateAssignmentModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    points: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: assignment.title,
        description: assignment.description,
        start_date: new Date(assignment.start_date).toISOString().split("T")[0],
        end_date: new Date(assignment.end_date).toISOString().split("T")[0],
        points: assignment.points,
      });
    }
  }, [isOpen, assignment]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "points" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const res = await axiosClient.put(
        `/assignments/update-assignment/${assignment.assignment_id}`,
        {
          ...formData,
          course_id: assignment.course_id,
          instructor_id: assignment.instructor_id,
        }
      );

      const data = await res.data;
      if (data.message) {
        toast.success(data.message);
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.error || "Failed to update assignment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Update Assignment</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200"
              type="text"
              id="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200"
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200"
              type="date"
              id="start_date"
              value={formData.start_date}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200"
              type="date"
              id="end_date"
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="points"
              className="block text-sm font-medium text-gray-700"
            >
              Points
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-200"
              type="number"
              id="points"
              value={formData.points}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssignmentModal;
