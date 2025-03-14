import React from 'react';
import { Filter, X, ChevronDown, Clock, TrendingUp, MessageSquare } from 'lucide-react';

interface ArticleFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoriesOptions: Array<{ category_id: number; name: string }>;
  resetFilters: () => void;
}

export const ArticleFilters: React.FC<ArticleFiltersProps> = ({
  showFilters,
  setShowFilters,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  categoriesOptions,
  resetFilters,
}) => {
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sortOption: string) => {
    setSortBy(sortOption);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
          Browse Articles
        </h2>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? (
              <X className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categoriesOptions.map((category) => (
                  <button
                    key={category.category_id}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      selectedCategory === category.name
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSortChange("latest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                    sortBy === "latest"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <Clock className="h-3 w-3" /> Latest
                </button>
                <button
                  onClick={() => handleSortChange("popular")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                    sortBy === "popular"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <TrendingUp className="h-3 w-3" /> Popular
                </button>
                <button
                  onClick={() => handleSortChange("comments")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all duration-200 ${
                    sortBy === "comments"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <MessageSquare className="h-3 w-3" /> Most Discussed
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategory !== "All" && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== "latest" && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                Sort: {sortBy}
                <button
                  onClick={() => setSortBy("latest")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {(selectedCategory !== "All" ||
              sortBy !== "latest" ||
              searchTerm) && (
              <button
                onClick={resetFilters}
                className="text-xs px-2 py-1 text-blue-700 hover:text-blue-900 ml-auto"
              >
                Reset all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleFilters;
