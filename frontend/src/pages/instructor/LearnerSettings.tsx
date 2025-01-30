import { DeactiveAccount } from "../../hooks/DeactiveAccount";
import { useAuth } from "../../hooks/useAuth";
import { LearnerLayout } from "../../layouts/LearnerLayout";
import { useState } from "react";

export const LearnerSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => setIsModalOpen(false);

  const { handleConfiremDeactive } = DeactiveAccount();

  return (
    <LearnerLayout>
      <div className="max-w-6xl p-6 bg-white rounded-lg shadow-sm space-y-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          Learner Settings
        </h2>

        {/* Profile Settings Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Profile Settings
          </h3>
          <p className="text-gray-600 mb-4">
            Update your personal information to keep your profile up to date.
          </p>
          <button className="w-full py-3 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none">
            Edit Profile
          </button>
        </div>

        {/* Change Password Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Change Password
          </h3>
          <p className="text-gray-600 mb-4">
            For your account security, change your password periodically.
          </p>
          <button className="w-full py-3 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700 transition duration-300 ease-in-out focus:outline-none">
            Change Password
          </button>
        </div>

        {/* Account Deactivation Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Deactivate Account
          </h3>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-300 mb-6">
            <p className="text-yellow-800 font-medium">
              Warning: Deactivating your account will permanently disable it,
              and you won't be able to recover any data.
            </p>
          </div>
          <button
            onClick={openModal}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none"
          >
            Deactivate Account
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Are you sure you want to deactivate your account? This action cannot
            be undone.
          </p>
        </div>
      </div>

      {/* Deactivation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Confirm Deactivation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate your account?
            </p>

            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="w-1/4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfiremDeactive(user?.userId)}
                className="w-1/4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </LearnerLayout>
  );
};
