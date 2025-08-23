import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "../../../types/StudentsProgress";

export const PaginationControls = ({
  pagination,
  currentPage,
  setPage,
}: {
  pagination: Pagination;
  currentPage: number;
  setPage: (p: number) => void;
}) => (
  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
    <div className="flex items-center gap-2">
      <button
        onClick={() => setPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <button
        onClick={() =>
          setPage(Math.min(pagination.totalPages, currentPage + 1))
        }
        disabled={currentPage === pagination.totalPages}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>

    <div className="text-sm text-gray-600">
      Page <span className="font-medium">{currentPage}</span> of{" "}
      <span className="font-medium">{pagination.totalPages}</span>
    </div>
  </div>
);
