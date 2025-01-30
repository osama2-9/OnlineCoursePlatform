import toast from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export const AccountSetting = () => {
  const { user } = useAuth();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Enable 2FA handler
  const enable2FA = async () => {
    try {
      const res = await axios.post(
        `${API}/auth/enable2FA`,
        {
          userId: user?.userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;
      if (data && data.qrCodeDataURL) {
        setQrCodeDataURL(data.qrCodeDataURL);
        setIs2FAEnabled(true);
        toast.success(
          "2FA has been enabled successfully. Please scan the QR code."
        );
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Error enabling 2FA.");
    }
  };

  return (
    <div>
      <AdminLayout>
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Account Settings
          </h1>

          {/* Security Settings Section */}
          <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">
              Security Settings
            </h2>
            <div className="mt-4 space-y-4">
              {/* Two-Factor Authentication Section */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Two-Factor Authentication (2FA)
                  </label>
                  <p className="text-sm text-gray-500">
                    {is2FAEnabled
                      ? "2FA is currently enabled."
                      : "2FA is currently disabled."}
                  </p>
                </div>
                <button
                  className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 ${
                    is2FAEnabled
                      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                  }`}
                  onClick={enable2FA}
                >
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {qrCodeDataURL && (
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800">
                Scan the QR Code in Google Authenticator
              </h2>
              <div className="mt-4">
                <img
                  src={qrCodeDataURL}
                  alt="QR Code for Google Authenticator"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Open Google Authenticator and scan the QR code to link your
                  account.
                </p>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </div>
  );
};
