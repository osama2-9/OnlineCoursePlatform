import { useState } from "react";
import { useGetInstructorEnrollments } from "../../hooks/useGetInstructorEnrollments";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { EnrollmentsData } from "../../hooks/useGetInstructorEnrollments";
import { Loading } from "../../components/Loading";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import {
  Loader2,
  Mail,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export const ShowEnrolledLearners = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { enrollments, enrollmentsLoading, pagintion } =
    useGetInstructorEnrollments(currentPage);
  console.log(pagintion);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentsData | null>(null);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [isSendEmailLoading, setIsSendEmailLoading] = useState<boolean>(false);

  const handleSendEmailClick = (enrollment: EnrollmentsData) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubject("");
    setText("");
    setSelectedEnrollment(null);
  };

  const sendEmail = async () => {
    if (!subject.trim() || !text.trim()) {
      toast.error("Please fill in both subject and message fields");
      return;
    }

    setIsSendEmailLoading(true);
    try {
      const res = await axios.post(
        `${API}/instructor/send-email`,
        {
          userEmail: selectedEnrollment?.user.email,
          subject,
          text,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        handleCloseModal();
        toast.success("Email sent successfully", {
          duration: 5000,
          position: "top-right",
          ariaProps: {
            role: "status",
            "aria-live": "assertive",
          },
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to send email");
    } finally {
      setIsSendEmailLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagintion?.totalPages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <InstructorLayout>
      <div className="min-h-screen  p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enrolled Learners
              </h1>
            </div>
            <p className="text-gray-600">
              Manage and communicate with your course participants
            </p>
          </div>

          {enrollmentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          ) : enrollments?.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No enrollments found
              </h3>
              <p className="text-gray-500">
                No learners have enrolled in your courses yet.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Learners
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {pagintion?.totalEnrollments || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Enrollments
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {enrollments?.filter((e) => e.status === "active")
                          .length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Learner
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Enrollment Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {enrollments?.map((enrollment, index) => (
                        <tr
                          key={enrollment.enrollment_id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10"></div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {enrollment.user.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {enrollment.user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.course.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              enrollment.enrollment_date
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                enrollment.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleSendEmailClick(enrollment)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                              Send Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagintion && (
                  <div className="bg-white px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {pagintion.currentPage - 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagintion.currentPage,
                            pagintion.totalPages
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {pagintion.totalPages}
                        </span>{" "}
                        results
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pagintion.totalPages}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Enhanced Modal */}
          {isModalOpen && selectedEnrollment && (
            <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2  rounded-lg">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Send Email
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Learner Details Card */}
                <div className="bg-gradient-to-r bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Learner Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedEnrollment.user.full_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">
                        {selectedEnrollment.user.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Course</p>
                      <p className="font-medium text-gray-900">
                        {selectedEnrollment.course.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Enrollment Date
                      </p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedEnrollment.enrollment_date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedEnrollment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedEnrollment.status}
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter email subject..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Write your message here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      rows={6}
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={
                      isSendEmailLoading || !subject.trim() || !text.trim()
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSendEmailLoading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};
