import { useState } from "react";
import { useGetInstructorEnrollments } from "../../hooks/useGetInstructorEnrollments";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { EnrollmentsData } from "../../hooks/useGetInstructorEnrollments";
import { Loading } from "../../components/Loading";
export const ShowEnrolledLearners = () => {
  const { enrollments, enrollmentsLoading, pagination } =
    useGetInstructorEnrollments();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<EnrollmentsData | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSendEmailClick = (enrollment: EnrollmentsData) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleSendEmail = () => {
    if (selectedEnrollment) {
      const mailtoLink = `mailto:${
        selectedEnrollment.user.email
      }?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        message
      )}`;
      window.location.href = mailtoLink;
      setIsModalOpen(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Enrolled Learners</h1>

        {enrollmentsLoading ? (
          <Loading />
        ) : enrollments?.length === 0 ? (
          <div className="text-center text-gray-600">No enrollments found.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Learner Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments?.map((enrollment) => (
                  <tr key={enrollment.enrollment_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.user.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        enrollment.enrollment_date
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleSendEmailClick(enrollment)}
                      >
                        Send Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {isModalOpen && selectedEnrollment && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
              <h2 className="text-xl font-bold mb-4">Send Email</h2>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Learner Details</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Name:</span>{" "}
                    {selectedEnrollment.user.full_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedEnrollment.user.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Course:</span>{" "}
                    {selectedEnrollment.course.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Enrollment Date:</span>{" "}
                    {new Date(
                      selectedEnrollment.enrollment_date
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEnrollment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedEnrollment.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
};
