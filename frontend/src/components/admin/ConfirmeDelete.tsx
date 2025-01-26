interface ConfirmeDeleteProps {
  title: string | undefined;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmeDelete = ({
  title,
  onConfirm,
  onCancel,
}: ConfirmeDeleteProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Confirm Delete
        </h2>

        <p className="text-gray-600 mb-6">
          <span className="font-semibold">{title}</span>? This action cannot be
          undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
