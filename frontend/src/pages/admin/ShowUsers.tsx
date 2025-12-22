import { useEffect, useState } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import { Loading } from "../../components/Loading";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import { UpdateUser } from "../../components/admin/UpdateUser";
import { BsThreeDots } from "react-icons/bs";
import { Loader2, Search, X, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../API/axios";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  lastLogin: string;
  is_active: boolean;
  authProvider: "google" | null;
}

interface Pagination {
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface FetchUsersResponse {
  users: User[];
  pagination: Pagination;
}

export const ShowUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 15,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [googleUsersOnly, setGoogleUsersOnly] = useState<boolean>(false);

  const fetchUsers = async (page: number, pageSize: number) => {
    try {
      const res = await axiosClient.get<FetchUsersResponse>(
        `/admin/get-users`,
        {
          params: { page, pageSize },
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch users");
      throw error;
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", pagination.currentPage, pagination.pageSize],
    queryFn: () => fetchUsers(pagination.currentPage, pagination.pageSize),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 24 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setAllUsers(data.users);
      setPagination({
        totalUsers: data.pagination.totalUsers,
        totalPages: data.pagination.totalPages,
        currentPage: data.pagination.currentPage,
        pageSize: data.pagination.pageSize,
      });
    }
  }, [data]);

  useEffect(() => {
    let result = [...allUsers];

    if (googleUsersOnly) {
      result = result.filter((user) => user.authProvider === "google");
    }

    if (isSearchActive && searchQuery) {
      result = result.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [allUsers, googleUsersOnly, isSearchActive, searchQuery]);

  const search = async () => {
    try {
      setIsSearching(true);
      setIsSearchActive(true);
      const res = await axiosClient.get(`/admin/search`, {
        params: {
          email: searchQuery.trim(),
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = res.data;

      if (data.success) {
        setAllUsers([data.data]);
        setIsSearchActive(true);
      } else {
        toast.error(data.message || "No user found");
        setAllUsers([]);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to search users");
      setAllUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (!query) {
      resetSearch();
    }
  };

  const handleSearchClick = () => {
    if (searchQuery) {
      search();
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setIsSearchActive(false);
    refetch();
  };

  const handleGoogleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoogleUsersOnly(e.target.checked);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1,
    }));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowUpdateModal(true);
  };

  const handleDelete = async (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await axiosClient.delete(`/admin/delete-user/${selectedUser.user_id}`, {
          withCredentials: true,
        });
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete user");
        console.log(error);
        
      } finally {
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await axiosClient.put(
        `/admin/account-status`,
        { user_id: user.user_id },
        { withCredentials: true }
      );
      toast.success(
        `User ${user.full_name} is now ${
          user.is_active ? "inactive" : "active"
        }`
      );
      refetch();
    } catch (error) {
      console.log(error);
      
      toast.error("Failed to toggle user status");
    }
  };

  const toggleDropdown = (userId: number) => {
    setOpenDropdownId((prevId) => (prevId === userId ? null : userId));
  };

  const onCancelUpdate = () => {
    setShowUpdateModal(false);
    setSelectedUser(null);
  };

  const onConfirmUpdate = async () => {
    setSelectedUser(null);
    setShowUpdateModal(false);
    refetch();
  };

  return (
    <AdminLayout>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="mt-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Users Management
              </h2>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="searchQuery"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                      placeholder="Search by email"
                    />
                    {isSearchActive && (
                      <button
                        onClick={resetSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" color="black" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSearchClick}
                    className="py-1.5 px-3 bg-gray-400 text-white text-sm rounded-md hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    disabled={!searchQuery}
                  >
                    {isSearching ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center text-sm gap-1 px-3 py-1.5 rounded-md border transition-colors ${
                      googleUsersOnly
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={googleUsersOnly}
                      onChange={handleGoogleFilterChange}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                      id="googleFilter"
                    />
                    <label
                      htmlFor="googleFilter"
                      className="flex items-center cursor-pointer"
                    >
                      <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        className="h-4 w-4 mr-1.5"
                      />
                      Google users only
                    </label>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xs text-gray-600">Show:</span>
                    <select
                      id="pageSize"
                      value={pagination.pageSize}
                      onChange={handlePageSizeChange}
                      className="p-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      ID
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Name
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Email
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Role
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Status
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Auth
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Joined
                    </th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Last Login
                    </th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-3 px-3 text-center text-sm text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-xs text-gray-500">
                          #{user.user_id}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-gray-800">
                          {user.full_name}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-500">
                          {user.email}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "moderator"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {user.is_active ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {user.authProvider === "google" ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              Google
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              Email
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-500">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-right relative">
                          <button
                            onClick={() => toggleDropdown(user.user_id)}
                            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            <BsThreeDots size={16} />
                          </button>

                          {openDropdownId === user.user_id && (
                            <div className="absolute right-2 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10 text-xs">
                              <button
                                onClick={() => handleEdit(user)}
                                className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                              >
                                Edit User
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className="block w-full px-3 py-1.5 text-left text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                              >
                                {user.is_active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                              >
                                Delete User
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="text-xs text-gray-500">
                {googleUsersOnly && (
                  <span className="inline-flex items-center mr-2 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Filter className="h-3 w-3 mr-1" />
                    Google users only ({filteredUsers.length} shown)
                  </span>
                )}
                Showing {filteredUsers.length} of {pagination.totalUsers} users
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {showDeleteModal && selectedUser && (
            <ConfirmeDelete
              title={selectedUser.full_name}
              onConfirm={confirmDelete}
              onCancel={cancelDelete}
            />
          )}

          {showUpdateModal && selectedUser && (
            <UpdateUser
              user_id={selectedUser.user_id}
              full_name={selectedUser.full_name}
              email={selectedUser.email}
              role={selectedUser.role}
              onCancel={onCancelUpdate}
              onConfirm={onConfirmUpdate}
            />
          )}
        </div>
      )}
    </AdminLayout>
  );
};
