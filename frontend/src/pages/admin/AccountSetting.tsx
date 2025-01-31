import toast from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";

export const AccountSetting = () => {
  const { user } = useAuth();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.towFAStatus);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const dispatch = useDispatch();

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

        dispatch(setUser({ ...user, towFAStatus: true }));

        toast.success(
          "2FA has been enabled successfully. Please scan the QR code."
        );
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Error enabling 2FA.");
    }
  };

  const disable2FA = async () => {
    try {
      const res = await axios.post(
        `${API}/auth/disable2FA`,
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
      const data = await res.data;
      if (data) {
        setIs2FAEnabled(false);

        dispatch(setUser({ ...user, towFAStatus: false }));

        toast.success(data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/auth/change-password`,
        {
          userId: user?.userId,
          oldPassword,
          newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = await res.data;
      if (data && data.message) {
        toast.success("Password changed successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Error changing password.");
    }
  };

  return (
    <div>
      <AdminLayout>
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Account Settings
          </h1>

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
                  onClick={is2FAEnabled ? disable2FA : enable2FA}
                >
                  {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </div>
            </div>
          </div>

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

          <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">
              Change Password
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Old Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full px-4 py-2 border rounded-md"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full px-4 py-2 border rounded-md"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full px-4 py-2 border rounded-md"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}

              <div className="mt-4">
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md"
                  onClick={handlePasswordChange}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </div>
  );
};
