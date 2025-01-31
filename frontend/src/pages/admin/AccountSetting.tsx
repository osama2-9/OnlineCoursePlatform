import toast from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/userSlice";
import { Shield, Key, AlertCircle, Loader2 } from "lucide-react";

export const AccountSetting = () => {
  const { user } = useAuth();
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.towFAStatus);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const dispatch = useDispatch();

  const enable2FA = async () => {
    setIsLoading2FA(true);
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
    } finally {
      setIsLoading2FA(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading2FA(true);
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
    } finally {
      setIsLoading2FA(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsLoadingPassword(true);
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
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Account Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your account security and preferences
                  </p>
                </div>
                <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2FA Section */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Two-Factor Authentication (2FA)
                    </h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>
                        Add an extra layer of security to your account by
                        enabling two-factor authentication.
                      </p>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          is2FAEnabled
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {is2FAEnabled ? "2FA Enabled" : "2FA Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                    <button
                      disabled={isLoading2FA}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        is2FAEnabled
                          ? "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          : "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                      } ${isLoading2FA ? "opacity-75 cursor-not-allowed" : ""}`}
                      onClick={is2FAEnabled ? disable2FA : enable2FA}
                    >
                      {isLoading2FA ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {is2FAEnabled ? "Disabling..." : "Enabling..."}
                        </>
                      ) : (
                        <>{is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCodeDataURL && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Set Up Google Authenticator
                  </h3>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img
                        src={qrCodeDataURL}
                        alt="QR Code for Google Authenticator"
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="text-sm text-gray-500 max-w-md text-center">
                      <p className="font-medium mb-2">Instructions:</p>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Open Google Authenticator on your mobile device</li>
                        <li>Tap the + button to add a new account</li>
                        <li>Scan the QR code shown above</li>
                        <li>Enter the verification code when signing in</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Password Change Section */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Change Password
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="old-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="old-password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={isLoadingPassword}
                        className="shadow-sm focus:ring-indigo-500 p-1 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoadingPassword}
                        className="shadow-sm focus:ring-indigo-500 p-1 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoadingPassword}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full p-1 sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {passwordError && (
                    <div className="sm:col-span-6">
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">
                              {passwordError}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-6">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isLoadingPassword}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isLoadingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AccountSetting;
