import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";

interface UpdateModalProps {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UpdateUser: React.FC<UpdateModalProps> = ({
  user_id,
  full_name,
  email,
  role,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    full_name,
    email,
    role,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateUser();
  };
  const handleUpdateUser = async () => {
    try {
      const res = await axios.put(`${API}/admin/update-user`, {
        user_id: user_id,
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
      } ,{
        headers:{
            "Content-Type":"application/json"
        },
        withCredentials:true
      });
      const data = await res.data;
      if (data.message) {
        toast.success(data.message);
        onConfirm();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
          <h2 className="text-xl font-bold mb-4">Update User</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                onChange={handleChange}
                value={formData.role}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                name="role"
                id="role"
              >
                <option value="learner">Learner</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
