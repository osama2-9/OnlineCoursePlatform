import  { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../utils/assignmentUtils';
import { API } from '../../API/ApiBaseUrl';
import { useAuth } from '../../hooks/useAuth';
import { InstructorLayout } from '../../layouts/InstructorLayout';
import { Loader2 } from 'lucide-react';

interface Submission {
  submission_id: number;
  student: {
    user_id: number;
    full_name: string;
  };
  file_url: string;
  submitted_at: string;
  assignment_id: number;
  grade?: number;
  feedback?: string;
  assignment: {
    assignment_id: number;
    start_date: string;
    points: number;
    end_date: string;
    title: string;
    course: {
      title: string;
    }
  };
}

const GradeAssignments = () => {
  const { courseId, assignmentId, courseTitle } = useParams();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedSubmission, setExpandedSubmission] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API}/assignments/get-submissions`, {
        params: {
          course_id: courseId,
          instructor_id: user?.userId,
          assignment_id: assignmentId
        },
        headers: {
          contentType: 'application/json'
        },
        withCredentials: true
      });

      const data = await res.data;
      if (data) {
        return data;
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch submissions");
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["submissions", courseId, assignmentId],
    queryFn: fetchSubmissions,
    staleTime: 12 * 60 * 60 * 1000,
    refetchInterval: 12 * 60 * 60 * 1000,
    retry: 2
  });

  useEffect(() => {
    if (data) {
      setSubmissions(data.submissions);
    }
  }, [data]);
  const handleSubmitGrade = async (submissionId: number) => {
    const submission = submissions.find(s => s.submission_id === submissionId);
    
    if (!submission) return;
    
    if (grade === 0) {
      toast.error("Please provide points for this submission");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.post(`${API}/assignments/submit-review`, {
        submission_id: submissionId,
        grade: grade,
        feedback: feedback,
        instructor_id: user?.userId,
        assignment_id: assignmentId
      }, {
        headers: {
          contentType: 'application/json'
        },
        withCredentials: true
      });
      
      toast.success("Grade submitted successfully");
      setExpandedSubmission(null);
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast.error("Failed to submit grade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin" size={24}/>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-6">
              <p>Error loading submissions. Please try again.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Grade Assignments {courseTitle && `for ${courseTitle}`}
                </h1>
                <button 
                  onClick={() => refetch()}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <div 
                      key={submission.submission_id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                        <div>
                          <h2 className="font-semibold text-lg text-gray-800">
                            {submission.assignment.title || `Assignment #${submission.assignment.assignment_id}`}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Submitted by {submission.student.full_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Submitted: {formatDate(submission.submitted_at)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {formatDate(submission.assignment.end_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              <span className="mr-2">Submission Link:</span>
                              <a 
                                href={submission.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline break-words"
                              >
                                {submission.file_url}
                              </a>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="mr-2">Total Points:</span>
                              <span className="font-medium">{submission.assignment.points}</span>
                            </p>
                          </div>
                          
                          <div className="md:text-right">
                            {submission.grade !== null ? (
                              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium text-sm">
                                Graded: {submission.grade}/{submission.assignment.points}
                              </div>
                            ) : (
                              <button
                                onClick={() => setExpandedSubmission(
                                  expandedSubmission === submission.submission_id ? null : submission.submission_id
                                )}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                {expandedSubmission === submission.submission_id ? "Cancel" : "Grade"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {expandedSubmission === submission.submission_id && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <h3 className="font-medium text-gray-800 mb-3">Add Grade</h3>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Points (max: {submission.assignment.points})
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={submission.assignment.points}
                              value={grade}
                              onChange={(e) =>setGrade(parseInt(e.target.value))}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Feedback (optional)
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Provide feedback to the student..."
                            ></textarea>
                          </div>
                          
                          <button
                            onClick={() => handleSubmitGrade(submission.submission_id)}
                            disabled={isSubmitting}
                            className={`w-full py-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-medium transition-colors flex justify-center items-center`}
                          >
                            {isSubmitting ? (
                              <>
                              <Loader2 className="animate-spin mr-2" size={20} color="white" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Grade"
                            )}
                          </button>
                        </div>
                      )}
                      
                      {submission.grade !== null && submission.feedback && (
                        <div className="p-4 border-t border-gray-100 bg-white">
                          <h3 className="font-medium text-gray-800 mb-2">Feedback</h3>
                          <p className="text-gray-700 text-sm whitespace-pre-line">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">No submitted assignments found.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </InstructorLayout>
  );
};

export default GradeAssignments;