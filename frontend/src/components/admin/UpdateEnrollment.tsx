import { useState } from "react";

interface UpdateEnrollmentProps {
  enrollmentStatus: "active" | "completed" | "dropped" | undefined;
  enrollmentAccessGranted: boolean | undefined;
  onUpdate: (
    status: "active" | "completed" | "dropped",
    accessGranted: boolean
  ) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export const UpdateEnrollment = ({
  enrollmentStatus,
  enrollmentAccessGranted,
  onUpdate,
  onCancel,
  isOpen,
}: UpdateEnrollmentProps) => {
  const [status, setStatus] = useState<"active" | "completed" | "dropped">(
    enrollmentStatus || "active"
  );
  const [accessGranted, setAccessGranted] = useState(
    enrollmentAccessGranted || false
  );

  const handleUpdate = () => {
    onUpdate(status, accessGranted); 
    onCancel(); 
  };

  return (
    <div>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-semibold">
                Update Enrollment Status
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onCancel}
              >
                ✖
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 space-y-6">
              {/* Status Selection */}
              <div>
                <p className="text-gray-600 mb-2">Select Enrollment Status:</p>
                <div className="space-y-3">
                  {["active", "completed", "dropped"].map((value) => (
                    <div
                      key={value}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{value}</span>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value={value}
                          checked={status === value}
                          onChange={(e) =>
                            setStatus(
                              e.target.value as
                                | "active"
                                | "completed"
                                | "dropped"
                            )
                          }
                          className="form-radio"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Granted Switch */}
              <div>
                <p className="text-gray-600 mb-2">Access Granted:</p>
                <label className="flex items-center space-x-3">
                  <span className="text-gray-700">No</span>
                  <div
                    className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
                      accessGranted ? "bg-green-500" : "bg-gray-300"
                    }`}
                    onClick={() => setAccessGranted(!accessGranted)}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform ${
                        accessGranted ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <span className="text-gray-700">Yes</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
