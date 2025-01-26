import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { API } from "../API/ApiBaseUrl";
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

export const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get("sessionId");

  useEffect(() => {
    if (sessionId) {
      const confirmPayment = async () => {
        try {
          const { data } = await axios.get(
            `${API}/payment/payment-success/${sessionId}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setMessage(data.message || "Payment completed successfully!");
        } catch (error) {
          console.error("Error confirming payment:", error);
          setMessage("Payment failed, please try again later.");
        } finally {
          setLoading(false);
        }
      };

      confirmPayment();
    } else {
      setMessage("No session ID found in the URL");
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-sm w-full bg-white p-8 rounded-lg shadow-md text-center">
        {loading ? (
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
          </div>
        ) : (
          <div>
            <FaCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold text-gray-800">{message}</h2>
            <p className="text-sm text-gray-600 mt-2">
              Thank you for your payment!
            </p>
            <div className="mt-4">
              <a
                href="/"
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
              >
                Go to Homepage
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
