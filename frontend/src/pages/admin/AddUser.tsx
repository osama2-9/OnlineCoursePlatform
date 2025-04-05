import React, { useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface FormData {
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
}

export const AddUser = () => {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    password_hash: "",
    role: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password_hash) {
      newErrors.password_hash = "Password is required";
    } else if (formData.password_hash.length < 8) {
      newErrors.password_hash = "Password must be at least 8 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Role selection is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const res = await axios.post(`${API}/admin/create-user`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = res.data;
      if (data) {
        toast.success("User created successfully!");
        setFormSubmitted(true);
        
        // Reset form after short delay
        setTimeout(() => {
          setFormData({
            full_name: "",
            email: "",
            password_hash: "",
            role: "",
          });
          setFormSubmitted(false);
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Failed to create user";
      toast.error(errorMessage);
      
      // Handle specific backend errors
      if (error?.response?.data?.field) {
        setErrors({
          ...errors,
          [error.response.data.field]: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "learner":
        return "bg-green-100 text-green-800";
      case "support":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new user account with specific role and permissions
            </p>
          </div>
          <UserPlus className="h-8 w-8 text-gray-400" />
        </div>

        {formSubmitted ? (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">User Created Successfully!</h3>
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-500">User Details</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-500">Name:</div>
                  <div className="text-gray-900 font-medium">{formData.full_name}</div>
                  <div className="text-gray-500">Email:</div>
                  <div className="text-gray-900 font-medium">{formData.email}</div>
                  <div className="text-gray-500">Role:</div>
                  <div>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getRoleColor(formData.role)}`}>
                      {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-6 mb-6"
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.full_name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                    placeholder="example@domain.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password_hash"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password_hash"
                    name="password_hash"
                    value={formData.password_hash}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      errors.password_hash ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                    placeholder="Minimum 8 characters"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {errors.password_hash && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password_hash}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Password should be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  User Role
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`block w-full pl-3 pr-10 py-2 border ${
                      errors.role ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-md shadow-sm focus:outline-none appearance-none bg-none sm:text-sm`}
                  >
                    <option value="">Select a role</option>
                    <option value="learner">Learner</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="support">Support</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500">
                      All fields are required to create a new user
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Role Information</h2>
          <div className="border-t border-gray-200 pt-4">
            <dl className="divide-y divide-gray-200">
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Learner</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  Standard user account. Can access courses, submit assignments, and participate in discussions.
                </dd>
              </div>
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Instructor</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  Can create and manage courses, grade assignments, and communicate with learners.
                </dd>
              </div>
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Admin</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  Full access to the platform. Can manage users, content, and system settings.
                </dd>
              </div>
              <div className="py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Support</dt>
                <dd className="text-sm text-gray-900 sm:col-span-2">
                  Can access customer support features, resolve tickets, and assist users with platform issues.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};