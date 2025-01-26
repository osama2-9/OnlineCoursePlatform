import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendar,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import { Loading } from "../Loading";

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

export const PaymentsHistory = ({ userId }: any) => {
  const [payments, setPayments] = useState<PaymentsData[] | null>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const paymentsSummary = Array.isArray(payments)
    ? payments.reverse().slice(0, 3)
    : [];

  const getPaymentsHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/learner/get-payments-history/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const data = await res.data;
      if (data) {
        setPayments(data);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPaymentsHistory();
  }, [userId]);

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loading />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Transactions
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Your latest course purchases
                </p>
              </div>
              <Link
                to="/learner/payments"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                View all
                <FaArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {paymentsSummary.length > 0 ? (
              <div className="space-y-4">
                {paymentsSummary.map((payment) => (
                  <div
                    key={payment.payment_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="mb-3 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {payment.course.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {new Date(payment.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <FaCreditCard className="mr-2 text-gray-400" />
                          {payment.payment_method}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          payment.payment_status === "succeeded"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.payment_status.charAt(0).toUpperCase() +
                          payment.payment_status.slice(1)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FaReceipt className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payment history
                </h3>
                <p className="text-gray-500 mb-6">
                  Your recent transactions will appear here
                </p>
                <Link
                  to="/explore-courses"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
