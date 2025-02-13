import axios from "axios";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Select from "react-select";
import { Loader2, Search, X, ChevronDown } from "lucide-react";
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

  const renderField = (label: string, value: string | string[] | number) => {
    const displayValue = Array.isArray(value) ? value.join(", ") : value;
    return (
      <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4">
        <span className="font-medium text-gray-700 mb-2 md:mb-0">{label}:</span>
        <span className="text-gray-600 md:text-right">{displayValue}</span>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white pb-4 mb-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Application Details
                </h2>
                <button
                  onClick={() => handleModalToggle()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center space-x-4">
                {selectedApplication.profile_picture_url && (
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-md flex-shrink-0">
                    <img
                      src={selectedApplication.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedApplication.full_name}
                  </h3>
                  <p className="text-gray-600">{selectedApplication.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Personal Information
                  </h3>
                  {renderField(
                    "Phone Number",
                    selectedApplication.phone_number
                  )}
                  {renderField("Bio", selectedApplication.bio)}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Professional Information
                  </h3>
                  {renderField(
                    "Expertise Areas",
                    selectedApplication.expertise_area
                  )}
                  {renderField(
                    "Years of Experience",
                    selectedApplication.years_of_experience
                  )}
                  {renderField(
                    "Education",
                    selectedApplication.education_background
                  )}
                  {renderField("Institution", selectedApplication.institution)}
                  {renderField("Degree", selectedApplication.degree)}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Teaching Information
                  </h3>
                  {renderField(
                    "Teaching Style",
                    selectedApplication.teaching_style
                  )}
                  {renderField(
                    "Language Skills",
                    selectedApplication.language_skills
                  )}
                  {renderField(
                    "Preferred Schedule",
                    selectedApplication.preferred_schedule
                  )}
                  {renderField(
                    "Previous Courses",
                    selectedApplication.previous_courses
                  )}
                  {renderField(
                    "Certifications",
                    selectedApplication.certifications
                  )}
                  {renderField(
                    "Preferred Course Type",
                    selectedApplication.preferred_course_type
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Application Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Current Status:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedApplication.application_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedApplication.application_status ===
                              "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedApplication.application_status
                          .charAt(0)
                          .toUpperCase() +
                          selectedApplication.application_status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Select
                        options={statusOptions}
                        value={statusOptions.find(
                          (option) =>
                            option.value ===
                            selectedApplication.application_status
                        )}
                        onChange={(option: any) =>
                          changeApplicationStatus(option.value)
                        }
                        isDisabled={isUpdating}
                        className="w-48"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: "#E5E7EB",
                            "&:hover": {
                              borderColor: "#D1D5DB",
                            },
                          }),
                          option: (base, { data }) => ({
                            ...base,
                            backgroundColor:
                              data.value ===
                              selectedApplication.application_status
                                ? data.color + "33"
                                : "white",
                            color: "black",
                            "&:hover": {
                              backgroundColor: data.color + "22",
                            },
                          }),
                        }}
                      />
                      {isUpdating && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>

                  {selectedApplication.notes && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">
                        Notes
                      </h4>
                      <p className="text-gray-600 bg-white p-3 rounded-md">
                        {selectedApplication.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
