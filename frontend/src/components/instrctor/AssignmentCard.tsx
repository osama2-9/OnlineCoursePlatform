import { Award, Calendar, Eye, Pencil, Trash2 } from "lucide-react";
import { Assignment } from "../../types/Assignment";
import { formatDate, getStatusDetails } from "../../utils/assignmentUtils";
import { Link } from "react-router-dom";

 const AssignmentCard = ({ assignment, totalStudents }: { assignment: Assignment, totalStudents: number }) => {
    
    const status = getStatusDetails(assignment.end_date);
    const submissionPercentage = Math.round((assignment._count.submissions / totalStudents) * 100);
    
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-blue-500" />
              <span className="text-sm font-medium">{assignment.points} Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="absolute top-0 left-0 h-2 rounded-full bg-blue-500" 
                  style={{ width: `${submissionPercentage}%` }} 
                />
              </div>
              <span className="text-xs text-gray-500">{assignment._count.submissions}/{totalStudents}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(assignment.start_date)} - {formatDate(assignment.end_date)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Link to={`/instructor/assignments/submissions/${assignment.assignment_id}/${assignment.course_id}/${assignment.course.title}`}>
                <button className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                  <Eye size={16} />
                </button>
              </Link>
              <button className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                <Pencil size={16} />
              </button>
              <button className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AssignmentCard