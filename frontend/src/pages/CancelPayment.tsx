import axios from "axios";
import { XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { API } from "../API/ApiBaseUrl";

export const CancelPayment = () => {
  const loaction = useLocation();
  const qurey = new URLSearchParams(loaction.search);
  const [loading, setLoading] = useState<boolean>(false);

  const sessionId = qurey.get("sessionId");

  useEffect(() => {
    if (sessionId) {
      const handleCancelPayment = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${API}/payment/payment-cancel/${sessionId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          const data = await res.data;
          if (data) {
            return res.status;
          }
        } catch (error: any) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      handleCancelPayment();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          {loading ? (
            <Loader2 color="#ef4444" size={20} />
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-500" />
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          Your payment process has been cancelled. You can try again or contact
          support if you need assistance.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Return to Home
          </Link>
          <Link
            to="/contact"
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};
