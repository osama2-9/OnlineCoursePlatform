import React, { useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";

export const AddUser = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password_hash: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/admin/create-user`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setFormData({
        full_name: "",
        email: "",
        password_hash: "",
        role: "",
      });
      const data = res.data;
      if (data) {
        toast.success("User created successfully!");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mt-5">
        <h2 className="text-xl font-semibold text-black mb-4">Add New User</h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-md p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password_hash"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password_hash"
              name="password_hash"
              value={formData.password_hash}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="">Select Role</option>
              <option value="learner">Learner</option>
              <option value="instructor">Instractor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-black text-white font-semibold rounded-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
