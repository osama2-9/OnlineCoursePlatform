import axios from "axios";
import toast from "react-hot-toast";
import { API } from "../../API/ApiBaseUrl";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  FileText, 
  GraduationCap, 
  Loader2, 
  AlertCircle, 
  ChevronRight 
} from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { qureyClinet } from "../../main";

interface Assignment {
  assignment_id: number;
  title: string;
  description: string;
  start_date: Date;
  points: number;
  end_date: Date;
  course: {
    course_id: string;
    title: string;
  };
}

const MyAssignments = ({ userId }: { userId: any }) => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const getAssignments = async () => {
    try {
      const res = await axios.get(`${API}/assignments/get-assignments`, {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          userId,
        },
        withCredentials: true,
      });
      return res.data?.data || [];
    } catch (error: any) {
      console.error("Failed to fetch assignments", error);
      toast.error(error?.response?.data?.error || "Failed to load assignments");
      return [];
    }
  };

  useEffect(() => {
    if (userId) {
      qureyClinet.prefetchQuery({
        queryKey: ["assignments", userId],
        queryFn: getAssignments,
        staleTime: 12 * 60 * 60 * 1000, 
        gcTime: 24 * 60 * 60 * 1000, 
      });
    }
  }, [userId]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignments", userId],
    queryFn: getAssignments,
    enabled: !!userId,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (data) {
      setAssignments(data);
    }
  }, [data]);

  const navigateToSubmission = (assignment: Assignment) => {
    navigate(`/learner/assignments/submission/${assignment.assignment_id}`, {
      state: {
        assignment
      }
    });
  };

  const getStatusBadge = (startDate: Date, endDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isBefore(now, start)) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Not Started
        </span>
      );
    } else if (isAfter(now, end)) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-500">
          Expired
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    }
  };

  // Filter assignments based on active tab
  const getFilteredAssignments = () => {
    if (!assignments) return [];

    const now = new Date();
    
    switch (activeTab) {
      case "upcoming":
        return assignments.filter(assignment => {
          const end = new Date(assignment.end_date);
          return isAfter(end, now);
        });
      case "past":
        return assignments.filter(assignment => {
          const end = new Date(assignment.end_date);
          return isBefore(end, now);
        });
      case "all":
      default:
        return assignments;
    }
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assignments</h1>
      <p className="text-gray-600 mb-6">View and manage all your course assignments</p>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {["upcoming", "past", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "upcoming" | "past" | "all")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-gray-50 rounded-md">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading assignments...</span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-gray-50 rounded-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {activeTab === "upcoming"
              ? "You don't have any upcoming assignments."
              : activeTab === "past"
              ? "You don't have any past assignments."
              : "You don't have any assignments yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.assignment_id}
              onClick={() => navigateToSubmission(assignment)}
              className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-100 w-full"
            >
              <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6">
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <GraduationCap className="w-5 h-5 text-gray-500 mr-2" />
                      <h3 className="font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                    </div>
                    {getStatusBadge(assignment.start_date, assignment.end_date)}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-500 mb-1 text-sm">
                      Course: <span className="text-gray-800">{assignment.course.title}</span>
                    </p>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {assignment.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Start: {format(new Date(assignment.start_date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Due: {format(new Date(assignment.end_date), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-1" />
                      <span>{assignment.points} points</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 sm:ml-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium transition-colors">
                    Submit
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;