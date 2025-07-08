import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../API/ApiBaseUrl";
import toast from "react-hot-toast";
import { AdminLayout } from "../../layouts/AdminLayout";
import Select from "react-select";
import { ImgReader } from "../../hooks/ImgReader";
import { useGetInstructor } from "../../hooks/useGetInstructor";

export const AddCourse = () => {
  const [learnOutcomes, setLearnOutcomes] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleImageChange, img } = ImgReader();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    instructor_id: 0,
    course_img: "",
    learn_outcome: learnOutcomes,
    category: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (img) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        course_img: img,
      }));
    }
  }, [img]);

  const { instractors } = useGetInstructor();
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "price" ? parseFloat(value) || 0 : value 
    });
  };

  const handleInstructorChange = (
    selectedOption: { value: number; label: string } | null
  ) => {
    setFormData({
      ...formData,
      instructor_id: selectedOption ? selectedOption.value : 0,
    });
  };

  const handleCategoryChange = (
    selectedOption: { value: string; label: string } | null
  ) => {
    setFormData({
      ...formData,
      category: selectedOption ? selectedOption.value : "",
    });
  };

  const handleLearnOutcomeChange = (index: number, value: string) => {
    const updatedLearnOutcomes = [...learnOutcomes];
    updatedLearnOutcomes[index] = value;
    setLearnOutcomes(updatedLearnOutcomes);
    setFormData({ ...formData, learn_outcome: updatedLearnOutcomes });
  };

  const handleAddLearnOutcome = () => {
    setLearnOutcomes([...learnOutcomes, ""]);
  };

  const handleRemoveLearnOutcome = (index: number) => {
    if (learnOutcomes.length > 1) {
      const updatedLearnOutcomes = learnOutcomes.filter((_, i) => i !== index);
      setLearnOutcomes(updatedLearnOutcomes);
      setFormData({ ...formData, learn_outcome: updatedLearnOutcomes });
    }
  };

  const categoryOptions = [
    { value: "programming", label: "Programming" },
    { value: "web-development", label: "Web Development" },
    { value: "data-science", label: "Data Science" },
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "business", label: "Business" },
    { value: "finance", label: "Finance" },
    { value: "artificial-intelligence", label: "Artificial Intelligence" },
    { value: "cloud-computing", label: "Cloud Computing" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "project-management", label: "Project Management" },
  ];

  // Convert date string to ISO format for Prisma
  const formatDateForPrisma = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        toast.error("End date must be after start date");
        setIsSubmitting(false);
        return;
      }
    }

    // Filter out empty learning outcomes
    const filteredOutcomes = learnOutcomes.filter(outcome => outcome.trim() !== "");
    
    if (filteredOutcomes.length === 0) {
      toast.error("Please add at least one learning outcome");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        learn_outcome: filteredOutcomes,
        start_date: formatDateForPrisma(formData.start_date),
        end_date: formatDateForPrisma(formData.end_date),
      };

      const res = await axios.post(`${API}/course/create-course`, submitData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = await res.data;
      if (data) {
        toast.success(data.message);
        // Reset form
        setFormData({
          title: "",
          description: "",
          price: 0,
          instructor_id: 0,
          course_img: "",
          learn_outcome: [""],
          category: "",
          start_date: "",
          end_date: "",
        });
        setLearnOutcomes([""]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create course";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const instructorOptions = Array.isArray(instractors)
    ? instractors.map((instructor) => ({
        value: instructor.user_id,
        label: instructor.full_name,
      }))
    : [];

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      padding: "0.5rem",
      borderRadius: "0.75rem",
      border: `2px solid ${state.isFocused ? "#3b82f6" : "#e5e7eb"}`,
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      transition: "all 0.2s ease-in-out",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#3b82f6" : "#eff6ff",
      },
    }),
  };

  return (
    <AdminLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
        

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
           

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="title">
                      Course Title *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                      placeholder="e.g., Advanced React Development"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="price">
                      Price (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500 font-medium">$</span>
                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                        placeholder="99.99"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="description">
                    Course Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                    placeholder="Describe what students will learn and achieve in this course..."
                    required
                  />
                  <p className="text-sm text-gray-500">Minimum 50 characters recommended</p>
                </div>
              </div>

              {/* Assignment & Category */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Assignment & Category
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Instructor *
                    </label>
                    <Select
                      options={instructorOptions}
                      onChange={handleInstructorChange}
                      value={instructorOptions.find(option => option.value === formData.instructor_id)}
                      isSearchable
                      placeholder="Search and select an instructor..."
                      styles={customSelectStyles}
                      className="react-select-container"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Category *
                    </label>
                    <Select
                      options={categoryOptions}
                      onChange={handleCategoryChange}
                      value={categoryOptions.find(option => option.value === formData.category)}
                      isSearchable
                      placeholder="Select a category..."
                      styles={customSelectStyles}
                      className="react-select-container"
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Course Timeline
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="start_date">
                      Start Date *
                    </label>
                    <input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700" htmlFor="end_date">
                      End Date *
                    </label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Course Media
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700" htmlFor="course_img">
                    Course Image *
                  </label>
                  <div className="relative">
                    <input
                      id="course_img"
                      name="course_img"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>
                  {img && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-700 mb-3">Preview:</p>
                      <img
                        src={img}
                        alt="Course Preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Learning Outcomes
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Define what students will be able to do after completing this course</p>
                  
                  {learnOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start space-x-3 group">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold mt-2">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={outcome}
                          onChange={(e) => handleLearnOutcomeChange(index, e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 resize-none"
                          placeholder={`Learning outcome ${index + 1}...`}
                          rows={2}
                          required
                        />
                      </div>
                      {learnOutcomes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnOutcome(index)}
                          className="flex-shrink-0 w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full flex items-center justify-center transition-all duration-200 mt-2 opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleAddLearnOutcome}
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Add Learning Outcome</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Course...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Course</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};