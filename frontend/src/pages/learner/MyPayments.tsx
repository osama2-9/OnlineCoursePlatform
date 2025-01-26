import { useEffect, useState } from "react";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { Loading } from "../../components/Loading";
import { FaReceipt } from "react-icons/fa";

interface PaymentsData {
  payment_id: number;
  user_id: number;
  amount: number;
  payment_status: string;
  payment_method: string;
  created_at: Date;
  course: {
    title: string;
    course_id: number;
  };
}

export const MyPayments = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentsData[] | null>(
    null
  );
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  const getPaymentHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/learner/get-payments-history/${user?.userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setPaymentHistory(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPaymentHistory();
  }, [user?.userId]);

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Payment History
            </h2>
            <p className="text-gray-600 mt-1">Track your course payments</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory?.map((payment) => (
                      <tr
                        key={payment.payment_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {payment.course.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.payment_status === "succeeded"
                                ? "bg-green-100 text-green-800"
                                : payment.payment_status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {(!paymentHistory || paymentHistory.length === 0) && (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payment history
                  </h3>
                  <p className="text-gray-500">
                    Your payment history will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};
