import axios from "axios";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, Search, X, ChevronDown, Mail, Phone, GraduationCap, BookOpen, Award, MessageSquare } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { AdminLayout } from "../../layouts/AdminLayout";
import { API } from "../../API/ApiBaseUrl";

interface Application {
  application_id: number;
  application_status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: Date;
  notes: string;
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  profile_picture_url: string;
  expertise_area: string[];
  certifications: string[];
  years_of_experience: number;
  education_background: string;
  institution: string;
  degree: string;
  previous_courses: string[];
  teaching_style: string;
  language_skills: string[];
  preferred_schedule: string;
  preferred_course_type: "free" | "paid";
}

interface Pagination {
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface ApplicationsResponse {
  applications: Application[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

const statusOptions = [
  { value: "pending", label: "Pending", color: "#FCD34D" },
  { value: "approved", label: "Approved", color: "#34D399" },
  { value: "rejected", label: "Rejected", color: "#EF4444" },
];

export const InstructorApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalPages: 0,
    currentPage: 1,
    totalItems: 0,
  });
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const getApplications = async () => {
    try {
      const res = await axios.get<ApplicationsResponse>(
        `${API}/application/get/${user?.userId}`,
        {
          params: {
            page: pagination.currentPage,
            limit: 10,
            search: searchTerm,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      toast.error(
        error?.response?.data?.error || "Failed to fetch applications"
      );
      throw error;
    }
  };

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["applications", pagination.currentPage, searchTerm],
    queryFn: getApplications,
  });

  useEffect(() => {
    if (data) {
      setApplications(data.applications);
      setPagination({
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        totalItems: data.totalItems,
      });
    }
  }, [data]);

  const handleModalToggle = (app?: Application) => {
    if (app) {
      setSelectedApplication(app);
    }
    setIsModalOpen((prev) => !prev);
  };

  const renderEnhancedField = (label:any, value:any, icon:any) => {
    if (!value) return null;

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1 min-w-0">
          <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
          <dd className="text-gray-900 break-words">{value}</dd>
        </div>
      </div>
    );
  };

  const changeApplicationStatus = async (newStatus: string) => {
    if (!selectedApplication) return;

    setIsUpdating(true);
    try {
      const res = await axios.put(
        `${API}/application/update-status/${selectedApplication.application_id}`,
        {
          application_status: newStatus,
          userId:user?.userId
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data && res.data.message) {
        toast.success("Status updated successfully");
      }
      refetch();
      setSelectedApplication((prev) =>
        prev ? { ...prev, application_status: newStatus as any } : null
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Error loading applications
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-white shadow-xl rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Instructor Applications
            </h1>
            <p className="text-gray-600">
              Manage and review instructor applications
            </p>
          </div>
          <div className="relative w-full md:w-72 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        ID
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        Full Name
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        Email
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        Phone
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                        Status
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-6 py-4 border-b border-gray-200"
                  >
                    <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr
                      key={app.application_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        #{app.application_id.toString().padStart(4, "0")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {app.profile_picture_url ? (
                            <img
                              src={app.profile_picture_url}
                              alt=""
                              className="h-8 w-8 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {app.full_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {app.full_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            app.application_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.application_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              app.application_status === "pending"
                                ? "bg-yellow-400"
                                : app.application_status === "approved"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></span>
                          {app.application_status.charAt(0).toUpperCase() +
                            app.application_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <button
                          onClick={() => handleModalToggle(app)}
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-gray-100 p-3 mb-4">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          No applications found
                        </p>
                        <p className="text-sm text-gray-500">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 px-2">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">5</span> of{" "}
              <span className="font-medium">{pagination.totalItems}</span>{" "}
              applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(prev.currentPage - 1, 1),
                }))
              }
              disabled={pagination.currentPage === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Page{" "}
                <span className="font-medium">{pagination.currentPage}</span> of{" "}
                <span className="font-medium">{pagination.totalPages}</span>
              </span>
            </div>
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.min(
                    prev.currentPage + 1,
                    pagination.totalPages
                  ),
                }))
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    Application Review
                  </h2>
                  <p className="text-gray-600">
                    Review candidate details and update application status
                  </p>
                </div>
                <button
                  onClick={() => handleModalToggle()}
                  className="p-3 hover:bg-white/80 rounded-full transition-all duration-200 group"
                >
                  <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center space-x-6">
                  {selectedApplication.profile_picture_url && (
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={selectedApplication.profile_picture_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedApplication.full_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{selectedApplication.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{selectedApplication.phone_number}</span>
                      </div>
                    </div>
                    {selectedApplication.bio && (
                      <p className="mt-3 text-gray-700 bg-white/70 p-4 rounded-lg">
                        "{selectedApplication.bio}"
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Professional Information */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-gray- p-4">
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="w-5 h-5 text-gray-900" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Professional Background
                          </h3>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {renderEnhancedField(
                          "Expertise Areas",
                          selectedApplication.expertise_area.join(", "),
                          "💼"
                        )}
                        {renderEnhancedField(
                          "Experience",
                          selectedApplication.years_of_experience,
                          "⏱️"
                        )}
                        {renderEnhancedField(
                          "Education",
                          selectedApplication.education_background,
                          "🎓"
                        )}
                        {renderEnhancedField(
                          "Institution",
                          selectedApplication.institution,
                          "🏫"
                        )}
                        {renderEnhancedField(
                          "Degree",
                          selectedApplication.degree,
                          "📜"
                        )}
                      </div>
                    </div>

                    {/* Teaching Information */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-white p-4">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="w-5 h-5 text-gray-900" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Teaching Information
                          </h3>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        {renderEnhancedField(
                          "Teaching Style",
                          selectedApplication.teaching_style,
                          "🎯"
                        )}
                        {renderEnhancedField(
                          "Languages",
                          selectedApplication.language_skills.join(", "),
                          "🌍"
                        )}
                        {renderEnhancedField(
                          "Schedule",
                          selectedApplication.preferred_schedule,
                          "📅"
                        )}
                        {renderEnhancedField(
                          "Previous Courses",
                          selectedApplication.previous_courses.join(", "),
                          "📚"
                        )}
                        {renderEnhancedField(
                          "Certifications",
                          selectedApplication.certifications.join(", "),
                          "🏆"
                        )}
                        {renderEnhancedField(
                          "Course Type",
                          selectedApplication.preferred_course_type,
                          "💻"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Application Status */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-white p-4">
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-gray-900" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Application Status
                          </h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-6">
                          {/* Current Status Display */}
                          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <div className="mb-3">
                                <span
                                  className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                                    selectedApplication.application_status ===
                                    "pending"
                                      ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
                                      : selectedApplication.application_status ===
                                        "approved"
                                      ? "bg-green-100 text-green-800 border-2 border-green-200"
                                      : "bg-red-100 text-red-800 border-2 border-red-200"
                                  }`}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-full mr-3 ${
                                      selectedApplication.application_status ===
                                      "pending"
                                        ? "bg-yellow-500"
                                        : selectedApplication.application_status ===
                                          "approved"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {selectedApplication.application_status
                                    .charAt(0)
                                    .toUpperCase() +
                                    selectedApplication.application_status.slice(
                                      1
                                    )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Current Status
                              </p>
                            </div>
                          </div>

                          {/* Status Change Controls */}
                          <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Update Status
                            </label>
                            <div className="flex items-center space-x-3">
                              <select
                                value={selectedApplication.application_status}
                                onChange={(e) =>
                                  changeApplicationStatus(e.target.value)
                                }
                                disabled={isUpdating}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                {statusOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              {isUpdating && (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {selectedApplication.notes && (
                      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-semibold text-white">
                              Review Notes
                            </h3>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                            <p className="text-gray-800 leading-relaxed">
                              {selectedApplication.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
