import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "../../layouts/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { Loading } from "../../components/Loading";
import { ConfirmeDelete } from "../../components/admin/ConfirmeDelete";
import { UpdateUser } from "../../components/admin/UpdateUser";
import { BsThreeDots } from "react-icons/bs";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  lastLogin: string;
  is_active: boolean;
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
  const [users, setUsers] = useState<User[] | null>([]);
  const [pagination, setPagination] = useState<Pagination>({
    totalUsers: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setIsLoading] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

  const cache = useRef<{ [key: number]: User[] }>({});

  const fetchUsers = async (page: number, pageSize: number) => {
    if (cache.current[page]) {
      setUsers(cache.current[page]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get<FetchUsersResponse>(
        `${API}/admin/get-users`,
        {
          params: { page, pageSize },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const data = res.data;

      const paginationData = data.pagination || {
        totalUsers: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
      };

      setUsers(data.users);
      setPagination(paginationData);
      cache.current[page] = data.users;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.error || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const search = async () => {
    try {
      const res = await axios.get(`${API}/admin/search`, {
        params: {
          userId:
            searchQuery && !isNaN(Number(searchQuery))
              ? searchQuery
              : undefined,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = res.data;

      if (data) {
        setUsers(data.data);
        setPagination({
          totalUsers: data.data.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to search users");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
  };

  const handleSearchClick = () => {
    if (searchQuery) {
      search();
    } else {
      fetchUsers(pagination.currentPage, pagination.pageSize);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize]);

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
        await axios.delete(`${API}/admin/delete-user/${selectedUser.user_id}`, {
          withCredentials: true,
        });
        toast.success("User deleted successfully");
        fetchUsers(pagination.currentPage, pagination.pageSize);
      } catch (error) {
        toast.error("Failed to delete user");
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
      await axios.put(
        `${API}/admin/account-status`,
        { user_id: user.user_id },
        { withCredentials: true }
      );
      toast.success(
        `User ${user.full_name} is now ${
          user.is_active ? "inactive" : "active"
        }`
      );
      fetchUsers(pagination.currentPage, pagination.pageSize);
    } catch (error) {
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
    await fetchUsers(pagination.currentPage, pagination.pageSize);
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <div className="mt-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <label
                htmlFor="searchQuery"
                className="font-semibold text-gray-700"
              >
                Search:
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
                placeholder="Search by name, email, or role"
              />
              <button
                onClick={handleSearchClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-indigo-800 focus:bg-indigo-500"
              >
                Search
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="pageSize" className="font-semibold text-gray-700">
                Show:
              </label>
              <select
                id="pageSize"
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
              <span className="text-gray-700">per page</span>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Users</h2>

            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      #
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Full Name
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Email
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Role
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Is Account Active
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Join Date
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Last Login
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 px-4 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users?.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.user_id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.full_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.role}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.is_active ? (
                            <span className="text-green-600 bg-green-50 p-1 rounded-lg">
                              Active
                            </span>
                          ) : (
                            <span className="text-red-600 bg-red-50 p-1 rounded-lg">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 border-b relative">
                          <button
                            onClick={() => toggleDropdown(user.user_id)}
                            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <BsThreeDots size={20} />
                          </button>

                          {openDropdownId === user.user_id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(user)}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                              >
                                {user.is_active ? "Deactivate" : "Activate"}
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

            <div className="flex justify-between items-center mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 focus:outline-none"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </button>
              <span className="text-lg text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gray-300 text-sm rounded-md hover:bg-gray-400 focus:outline-none"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </button>
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
