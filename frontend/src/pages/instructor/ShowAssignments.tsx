import { InstructorLayout } from "../../layouts/InstructorLayout";
import { Plus, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AssignmentCard from "../../components/instrctor/AssignmentCard";
import { getDaysRemaining } from "../../utils/assignmentUtils";
import { Assignment, Pagination } from "../../types/Assignment";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 5;

interface AssignmentResponse {
    assignments: Assignment[],
    total_submissions: number,
    total_students: number,
    pagination: Pagination
}

const ShowAssignments = () => {
    const { user } = useAuth();
    const { courseId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);

    const fetchAssignemts = async () => {
        try {
            const res = await axios.get<AssignmentResponse>(`${API}/assignments/get-all-assignments`, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
                params: {
                    course_id: courseId,
                    instructor_id: user?.userId,
                    page: currentPage,
                    limit: ITEMS_PER_PAGE
                }
            });
            if (res.data) {
                return res.data;
            }
        } catch (error: any) {
            console.log(error);
        }
    }


    const { data, isLoading } = useQuery({
        queryKey: ['assignments', courseId, pagination?.currentPage, pagination?.totalPages],
        queryFn: fetchAssignemts,
        staleTime: 12 * 60 * 60 * 1000,
        refetchInterval: 12 * 60 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if (data) {
            setAssignments(data.assignments);
            setTotalSubmissions(data.total_submissions);
            setTotalStudents(data.total_students);
            setPagination(data.pagination);

        }
    }, [data]);

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.description.toLowerCase().includes(searchQuery.toLowerCase());


        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (isLoading) {
        return <div className="flex items-center justify-center mt-52 ">
            <Loader2 size={24} color="blue" className="animate-spin" />
        </div>
    }
    return (
        <InstructorLayout>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <h1 className="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">Assignments Dashboard</h1>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Active Assignments</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {assignments.filter(a => getDaysRemaining(a.end_date) > 0).length}
                                </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Submission Rate</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {Math.round(
                                        (totalSubmissions / totalStudents) * 100
                                    )}%
                                </div>
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Ending Soon</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {assignments.filter(a => {
                                        const days = getDaysRemaining(a.end_date);
                                        return days > 0 && days <= 7;
                                    }).length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="flex space-x-3 w-full md:w-auto">


                            <Link to="/instructor/assignments/create">
                                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Plus size={16} className="-ml-1 mr-2" />
                                    New Assignment
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {paginatedAssignments.length > 0 ? (
                            paginatedAssignments.map((assignment) => (
                                <AssignmentCard key={assignment.assignment_id} assignment={assignment} totalStudents={totalStudents} />
                            ))
                        ) : (
                            <div className="col-span-3 py-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                                No assignments found. Try adjusting your search or filters.
                            </div>
                        )}
                    </div>



                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <div className="hidden sm:flex">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 mx-1 flex items-center justify-center rounded-md ${currentPage === i + 1
                                            ? 'bg-gray-200 text-gray-800 border border-gray-300'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <span className="sm:hidden text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </InstructorLayout>
    );
};

export default ShowAssignments;