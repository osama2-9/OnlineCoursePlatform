import { useState, useEffect } from "react";
import { Course } from "../../types/Course";
import Select from "react-select";
import { useGetInstructor } from "../../hooks/useGetInstructor";
import { ImgReader } from "../../hooks/ImgReader";

interface UpdateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: Course | null;
  onUpdateCourse: (updatedCourse: any) => void;
}

export const UpdateCourse = ({
  isOpen,
  onClose,
  courseData,
  onUpdateCourse,
}: UpdateCourseModalProps) => {
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [instructorId, setInstructorId] = useState<number | null>(null);
  const [learnOutcomes, setLearnOutcomes] = useState<string[]>([]);
  const [courseType, setCourseType] = useState<"free" | "paid">("paid");
  const { instractors } = useGetInstructor();
  const { handleImageChange, img } = ImgReader();

  const instructorOptions = Array.isArray(instractors)
    ? instractors.map((instructor) => ({
        value: instructor.user_id,
        label: instructor.full_name,
      }))
    : [];

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
  useEffect(() => {
    if (courseData) {
      console.log(courseData);
      setTitle(courseData.title);
      setPrice(courseData.price);
      setCategory(courseData.category || "programming");
      setDescription(courseData.description || "");
      setInstructorId(courseData.instructor.user_id);
      setLearnOutcomes(courseData.learning_outcomes || []);
      setCourseType(courseData.course_type || "paid");
    }
  }, [courseData]);

  const handleInstructorChange = (selectedOption: any) => {
    setInstructorId(selectedOption.value);
  };

  const handleCategoryChange = (selectedOption: any) => {
    setCategory(selectedOption.value);
  };

  const handleLearnOutcomeChange = (index: number, value: string) => {
    const updatedOutcomes = [...learnOutcomes];
    updatedOutcomes[index] = value;
    setLearnOutcomes(updatedOutcomes);
  };

  const addLearnOutcome = () => {
    setLearnOutcomes([...learnOutcomes, ""]);
  };

  const removeLearnOutcome = (index: number) => {
    const updatedOutcomes = learnOutcomes.filter((_, i) => i !== index);
    setLearnOutcomes(updatedOutcomes);
  };

  const handleUpdate = () => {
    if (
      !title ||
      !description ||
      !price ||
      !category ||
      !courseType ||
      learnOutcomes.length === 0 ||
      !instructorId
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (courseData && instructorId) {
      const updatedCourse = {
        course_id: courseData.course_id,
        title: title,
        description: description,
        price: price,
        category: category,
        courseType: courseType,
        learning_outcomes: learnOutcomes,
        is_published: courseData.is_published,
        course_img: img || courseData.course_img,
        instructor: {
          ...courseData.instructor,
          user_id: instructorId,
        },
      };
      onUpdateCourse(updatedCourse);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Update Course</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Course Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor
              </label>
              <Select
                options={instructorOptions}
                onChange={handleInstructorChange}
                value={instructorOptions.find(
                  (option) => option.value === instructorId
                )}
                className="mt-1"
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select
                options={categoryOptions}
                onChange={handleCategoryChange}
                value={
                  categoryOptions.find((option) => option.value === category) ||
                  null
                }
                className="mt-1"
                isSearchable
                placeholder="Select a category"
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

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="free"
                    checked={courseType === "free"}
                    onChange={() => setCourseType("free")}
                    className="mr-2"
                  />
                  Free
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paid"
                    checked={courseType === "paid"}
                    onChange={() => setCourseType("paid")}
                    className="mr-2"
                  />
                  Paid
                </label>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Outcomes
              </label>
              {learnOutcomes.map((outcome, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    placeholder={`Learning Outcome ${index + 1}`}
                    value={outcome}
                    onChange={(e) =>
                      handleLearnOutcomeChange(index, e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeLearnOutcome(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                onClick={addLearnOutcome}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Learning Outcome
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Image
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {img || courseData?.course_img ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                  <img
                    src={img || courseData?.course_img}
                    alt="Course Image"
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
