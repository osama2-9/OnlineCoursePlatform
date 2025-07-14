import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  User,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { Certification } from "../../types/Certifications";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export const CertificationsRequests = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const handleFetchCertificationsRequests = async () => {
    try {
      const response = await axios.get(
        `${API}/certifications/get-certifications-requests`,
        {
          params: {
            instructorId: user?.userId,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await response.data;

      return data.certifications;
    } catch (error) {
      console.error("Failed to fetch certifications requests:", error);
    }
  };

  
  const handleApproveSelected = async () => {
    if (!selectedRequest) return;

    const selectedCert = certifications.find(
      (cert) => cert.id === selectedRequest
    );
    if (!selectedCert) return;

    try {
      const response = await axios.post(
        `${API}/certifications/approve-certification-request`,
        {
          userId: selectedCert.user_id,
          courseId: selectedCert.course_id,
          certificationId: selectedCert.id,
          instructorId: user?.userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await response.data;
      toast.success(data.message);

      setCertifications((prev) =>
        prev.map((cert) =>
          cert.id === selectedRequest ? { ...cert, status: "approved" } : cert
        )
      );

      setSelectedRequest(null);
    } catch (error) {
      console.error("Error approving selected request:", error);
    }
  };

  const handleGenerateApprovedCertifications = async (cert: Certification) => {
    try {
      const response = await axios.post(
        `${API}/certifications/generate-approved-certifications`,
        
        {
          userId: cert.user_id,
          courseId: cert.course_id,
          certificationId: cert.id,
        
        },
        {
         
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await response.data;
      toast.success(data.message);
    } catch (error) {
      console.error("Error generating approved certifications:", error);
    }
  }

  
  const { data, isLoading } = useQuery({
    queryKey: ["certificationsRequests"],
    queryFn: handleFetchCertificationsRequests,
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  useEffect(() => {
    if (data) {
      setCertifications(data);
    }
  }, [data]);
  if (isLoading) {
    return (
      <InstructorLayout>
        <div className="flex items-center flex-col justify-center h-screen">
          <Loader2 className="animate-spin text-black mb-5" size={20} />
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </InstructorLayout>
    );
  }

  
  const handleSelectRequest = (id: number) => {
    setSelectedRequest(selectedRequest === id ? null : id);
  };

  const getFilteredCertifications = () => {
    if (filter === "all") return certifications;
    return certifications.filter((cert) => cert.status === filter);
  };

  const filteredCertifications = getFilteredCertifications();


  const getStatusIcon = (status: any) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const selectedCert = selectedRequest
    ? certifications.find((cert) => cert.id === selectedRequest)
    : null;

  return (
    <InstructorLayout>
      <div className=" mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Management
          </h1>
          <p className="text-gray-600">
            Review certificate requests and generate certificates for approved
            students
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.filter((c) => c.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certifications.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                All ({certifications.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg ${filter === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Pending (
                {certifications.filter((c) => c.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg ${filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Approved (
                {certifications.filter((c) => c.status === "approved").length})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded-lg ${filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Rejected (
                {certifications.filter((c) => c.status === "rejected").length})
              </button>
            </div>

            {selectedRequest && selectedCert?.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={handleApproveSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Selected
                </button>
              </div>
            )}
          </div>
        </div>

       
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="radio"
                        name="selectedRequest"
                        checked={selectedRequest === cert.id}
                        onChange={() => handleSelectRequest(cert.id)}
                        className="border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {cert.user_full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cert.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {cert.course_title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {cert.requested_at}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          cert.status
                        )}`}
                      >
                        {getStatusIcon(cert.status)}
                        <span className="ml-1 capitalize">{cert.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {cert.verification_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                      

                        {cert.status === "approved" && (
                          <button onClick={() => handleGenerateApprovedCertifications(cert)}  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                            <Award className="w-4 h-4" />
                            Generate & Send
                          </button>
                        )}

                        {cert.status === "rejected" && (
                          <span className="text-sm text-gray-500 italic">
                            Request rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCertifications.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No certification requests found.</p>
            </div>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};
