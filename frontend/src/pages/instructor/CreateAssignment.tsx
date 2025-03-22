import axios from "axios";
import { InstructorLayout } from "../../layouts/InstructorLayout";
import { Calendar, Clock, GraduationCap, Info, Link as LinkIcon, Loader2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { API } from "../../API/ApiBaseUrl";
import { useAuth } from "../../hooks/useAuth";
import { useGetInstructorCourses } from "../../hooks/useGetInstructorCourses";

const CreateAssignment = () => {
    const { user } = useAuth();
    const { courses, isLoading: coursesLoading } = useGetInstructorCourses();
    
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        points: "",
        instructor_id: user?.userId,
        course_id: null,
        attachments: [] as File[]
    });
    
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);

    const courseOptions = courses?.map(course => ({
        value: course.course_id,
        label: course.title
    })) || [];

    useEffect(() => {
        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                course_id: selectedCourse.value
            }));
        }
    }, [selectedCourse]);

    const handleSubmit = async (e: React.FormEvent) => {
        try {
            e.preventDefault();
            if (!formData.title.trim() || !formData.description.trim() || !formData.start_date || 
                !formData.end_date || !formData.points || !formData.instructor_id || !formData.course_id) {
                toast.error("Please fill all required fields");
                return;
            }

            setLoading(true);
            const submissionData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                start_date: formData.start_date,
                end_date: formData.end_date,
                points: Number(formData.points),
                instructor_id: Number(formData.instructor_id),
                course_id: Number(formData.course_id)
            };

            const res = await axios.post(`${API}/assignments/create-assignment`, submissionData, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            });

            const data = await res.data;
            if (data) {
                toast.success(data.message);
                setFormData({
                    title: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    points: "",
                    course_id: null,
                    instructor_id: user?.userId || 0,
                    attachments: []
                });
                setSelectedCourse(null);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create assignment");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <InstructorLayout>
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Assignment</h1>
                    <p className="text-gray-600 mb-8">Fill in the details below to create an assignment for your students</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                        <div className="space-y-2">
                            <label htmlFor="course" className="flex items-center text-sm font-medium text-gray-700">
                                <GraduationCap className="w-4 h-4 mr-2" />
                                Select Course <span className="text-red-500 ml-1">*</span>
                            </label>
                            <Select
                                id="course"
                                value={selectedCourse}
                                onChange={setSelectedCourse}
                                options={courseOptions}
                                isLoading={coursesLoading}
                                placeholder="Select a course"
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isSearchable
                                required
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: '#e2e8f0',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: '#cbd5e0',
                                        },
                                        minHeight: '42px',
                                    }),
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700">
                                <Info className="w-4 h-4 mr-2" />
                                Assignment Title <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter assignment title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700">
                                <Info className="w-4 h-4 mr-2" />
                                Assignment Description <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={4}
                                placeholder="Enter a detailed description of the assignment"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="startDate" className="flex items-center text-sm font-medium text-gray-700">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Start Date <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="endDate" className="flex items-center text-sm font-medium text-gray-700">
                                    <Clock className="w-4 h-4 mr-2" />
                                    Due Date <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="points" className="flex items-center text-sm font-medium text-gray-700">
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Total Points <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                                type="number"
                                id="points"
                                value={formData.points}
                                onChange={(e) => setFormData({...formData, points: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter total points"
                                min="0"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="attachments" className="flex items-center text-sm font-medium text-gray-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Attachments (Optional)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (Max 10MB)</p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => setFormData({...formData, attachments: Array.from(e.target.files || [])})}
                                        accept=".pdf,.doc,.docx,.txt"
                                    />
                                </label>
                            </div>
                            {formData.attachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                                    <ul className="text-sm text-gray-500 list-disc pl-5">
                                        {Array.from(formData.attachments).map((file, index) => (
                                            <li key={index}>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Assignment"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </InstructorLayout>
        </div>
    );
};

export default CreateAssignment;