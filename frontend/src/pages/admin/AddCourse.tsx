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
  const { handleImageChange, img } = ImgReader();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    instructor_id: 0,
    course_img: "",
    learn_outcome: learnOutcomes,
    category: "",
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    const updatedLearnOutcomes = learnOutcomes.filter((_, i) => i !== index);
    setLearnOutcomes(updatedLearnOutcomes);
    setFormData({ ...formData, learn_outcome: updatedLearnOutcomes });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/course/create-course`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const data = await res.data;
      if (data) {
        toast.success(data.message);
        setFormData({
          title: "",
          description: "",
          price: 0,
          instructor_id: 0,
          course_img: "",
          learn_outcome: [""],
          category: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  const instructorOptions = Array.isArray(instractors)
    ? instractors.map((instructor) => ({
        value: instructor.user_id,
        label: instructor.full_name,
      }))
    : [];

  const mapedCategorysOptions = Array.isArray(categoryOptions)
    ? categoryOptions.map((category) => ({
        value: category.value,
        label: category.label,
      }))
    : [];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-2xl mt-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create a New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Price in the Same Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-lg font-semibold text-gray-700 mb-2"
                htmlFor="title"
              >
                Course Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <label
                className="block text-lg font-semibold text-gray-700 mb-2"
                htmlFor="price"
              >
                Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter course price"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-lg font-semibold text-gray-700 mb-2"
              htmlFor="description"
            >
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter course description"
              required
            />
          </div>

          {/* Instructor - React Select */}
          <div>
            <label
              className="block text-lg font-semibold text-gray-700 mb-2"
              htmlFor="instructor_id"
            >
              Instructor
            </label>
            <Select
              options={instructorOptions}
              onChange={handleInstructorChange}
              value={instructorOptions.find(
                (option) => option.value === formData.instructor_id
              )}
              className="mt-2"
              isSearchable
              placeholder="Search and select an instructor"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#3b82f6",
                  },
                }),
              }}
            />
          </div>
          <div>
            <label
              className="block text-lg font-semibold text-gray-700 mb-2"
              htmlFor="instructor_id"
            >
              Category
            </label>
            <Select
              options={mapedCategorysOptions}
              onChange={handleCategoryChange}
              value={mapedCategorysOptions.find(
                (option) => option.value === formData.category
              )}
              className="mt-2"
              isSearchable
              placeholder="Search and select a category"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  borderColor: "#d1d5db",
                  "&:hover": {
                    borderColor: "#3b82f6",
                  },
                }),
              }}
            />
          </div>

          {/* Course Image */}
          <div>
            <label
              className="block text-lg font-semibold text-gray-700 mb-2"
              htmlFor="course_img"
            >
              Course Image
            </label>
            <input
              id="course_img"
              name="course_img"
              type="file"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
            {img && (
              <div>
                <img
                  src={img}
                  alt="Course Preview"
                  className="w-52 rounded-md p-2"
                />
              </div>
            )}
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Learning Outcomes
            </label>
            {learnOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-3 mb-4">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) =>
                    handleLearnOutcomeChange(index, e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder={`Outcome ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLearnOutcome(index)}
                  className="text-red-500 hover:text-red-700 text-2xl"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddLearnOutcome}
              className="text-blue-600 hover:text-blue-800 mt-2 flex items-center space-x-2"
            >
              <span>Add Learning Outcome</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-black transition-all duration-200"
          >
            Create Course
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
