import React, { useState } from "react";
import { Loader } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { FaCloudUploadAlt } from "react-icons/fa";

interface MentorFormData {
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  profile_picture: File | null;
  expertise_area: string[];
  certifications: string[];
  years_of_experience: number;
  education_background: string;
  institution: string;
  degree: string;
  previous_courses: string[];
  teaching_style: string;
  language_skills: string[];
  preferred_schedule: string;
}

const BecomeMentor = () => {
  const [uploadProfileImgProgress, setUploadProfileImgProgress] =
    useState<number>(0);
  const [isLoadingUpload, setIsLoadingUpload] = useState<boolean>(false);
  const [formData, setFormData] = useState<MentorFormData>({
    full_name: "",
    email: "",
    phone_number: "",
    bio: "",
    profile_picture: null,
    expertise_area: [],
    certifications: [],
    years_of_experience: 0,
    education_background: "",
    institution: "",
    degree: "",
    previous_courses: [],
    teaching_style: "",
    language_skills: [],
    preferred_schedule: "",
  });
  const cloudinaryCloude = import.meta.env.VITE_CLOUDE_NAME;
  const cloudinaryUploadrePreset = import.meta.env.VITE_UPLOAD_PRESET;
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone_number: value }));
    setErrors((prev) => ({ ...prev, phone_number: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profile_picture: file,
      }));
    }
  };

  const uploadProfileImg = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", `${cloudinaryUploadrePreset}`);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloude}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProfileImgProgress(progress);
            }
          },
        }
      );

      if (response) {
        return response.data.secure_url;
      }
      throw new Error("Failed to upload image");
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
      return null;
    }
  };

  const handleArrayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof MentorFormData
  ) => {
    const values = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({ ...prev, [field]: values }));
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    }
    if (!formData.bio || formData.bio.length < 100) {
      newErrors.bio = "Bio must be at least 100 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.expertise_area.length === 0) {
      newErrors.expertise_area = "At least one expertise area is required";
    }
    if (formData.years_of_experience < 0) {
      newErrors.years_of_experience = "Years of experience cannot be negative";
    }
    if (!formData.education_background) {
      newErrors.education_background = "Education background is required";
    }
    if (!formData.teaching_style) {
      newErrors.teaching_style = "Teaching style is required";
    }

    if (!formData.certifications) {
      newErrors.certifications = "Certifications is required";
    }

    if (!formData.degree) {
      newErrors.degree = "Degree is required";
    }
    if (!formData.previous_courses) {
      newErrors.previous_courses = "Previous Courses is required";
    }
    if (!formData.language_skills) {
      newErrors.language_skills = "Language Skills is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let profileImgUrl = formData.profile_picture;
      if (formData.profile_picture) {
        setIsLoadingUpload(true);
        profileImgUrl = await uploadProfileImg(formData.profile_picture);
        if (!profileImgUrl) {
          setIsSubmitting(false);
          setIsLoadingUpload(false);
          return;
        }
        setIsLoadingUpload(false);
      }

      const response = await axios.post(
        `${API}/application/send-application`,
        {
          ...formData,
          profile_picture: profileImgUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data?.message) {
        toast.success(response.data.message);
        setFormData({
          full_name: "",
          email: "",
          phone_number: "",
          bio: "",
          profile_picture: null,
          expertise_area: [],
          certifications: [],
          years_of_experience: 0,
          education_background: "",
          institution: "",
          degree: "",
          previous_courses: [],
          teaching_style: "",
          language_skills: [],
          preferred_schedule: "",
        });
        setUploadProfileImgProgress(0);
        setStep(1);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to submit application"
      );
    } finally {
      setIsSubmitting(false);
      setIsLoadingUpload(false);
    }
  };

  const ReviewComponent = () => {
    const renderField = (label: string, value: string | string[] | number) => {
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      return (
        <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4">
          <span className="font-medium text-gray-700 mb-2 md:mb-0">
            {label}:
          </span>
          <span className="text-gray-600 md:text-right">{displayValue}</span>
        </div>
      );
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Application Review
        </h2>
        <div className="space-y-6">
          {formData.profile_picture && (
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={URL.createObjectURL(formData.profile_picture)}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Personal Information
              </h3>
              {renderField("Full Name", formData.full_name)}
              {renderField("Email", formData.email)}
              {renderField("Phone", formData.phone_number)}
              {renderField("Bio", formData.bio)}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Professional Information
              </h3>
              {renderField("Expertise Areas", formData.expertise_area)}
              {renderField("Years of Experience", formData.years_of_experience)}
              {renderField("Education", formData.education_background)}
              {renderField("Institution", formData.institution)}
              {renderField("Degree", formData.degree)}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Additional Information
            </h3>
            {renderField("Teaching Style", formData.teaching_style)}
            {renderField("Language Skills", formData.language_skills)}
            {renderField("Preferred Schedule", formData.preferred_schedule)}
            {renderField("Previous Courses", formData.previous_courses)}
            {renderField("Certifications", formData.certifications)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Become a Mentor</h1>
        <p className="text-gray-600 text-center mb-8">
          Share your knowledge and expertise with the next generation of
          learners.
        </p>

        <div className="flex justify-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-1/3 h-2 ${
                stepNumber === step
                  ? "bg-blue-500"
                  : stepNumber < step
                  ? "bg-green-500"
                  : "bg-gray-200"
              } ${
                stepNumber !== 3 ? "mr-2" : ""
              } rounded-full transition-colors duration-300`}
            />
          ))}
        </div>

        {step === 1 && (
          <form className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.full_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={"us"}
                value={formData.phone_number}
                onChange={handlePhoneChange}
                inputClass={`w-full px-4 py-2 rounded-lg border ${
                  errors.phone_number ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone_number}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                  formData.profile_picture
                    ? "border-green-500 bg-green-50"
                    : isLoadingUpload
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-500"
                }`}
              >
                <div className="text-center">
                  <FaCloudUploadAlt
                    className={`mx-auto h-12 w-12 ${
                      isLoadingUpload ? "text-blue-400" : "text-gray-400"
                    }`}
                  />
                  <div className="mt-4">
                    <label
                      htmlFor="profile-picture"
                      className={`cursor-pointer text-blue-500 hover:text-blue-600 ${
                        isLoadingUpload ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {isLoadingUpload
                        ? "Uploading..."
                        : "Upload your profile picture"}
                    </label>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoadingUpload}
                    />
                  </div>
                  {formData.profile_picture && !isLoadingUpload && (
                    <p className="mt-2 text-sm text-gray-500">
                      Selected: {formData.profile_picture.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {uploadProfileImgProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProfileImgProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Uploading: {uploadProfileImgProgress}%
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                rows={4}
                placeholder="Tell us about your teaching experience and passion..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next Step
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">
              Professional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expertise Areas *
                </label>
                <input
                  type="text"
                  value={formData.expertise_area.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "expertise_area")}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.expertise_area ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="JavaScript, React, Node.js"
                />
                {errors.expertise_area && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.expertise_area}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="years_of_experience"
                  value={formData.years_of_experience}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.years_of_experience
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.years_of_experience && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.years_of_experience}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages *
                </label>
                <input
                  type="text"
                  value={formData.language_skills.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "language_skills")}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.language_skills
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Arabic,English,French"
                />
                {errors.language_skills && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.language_skills}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Degree *
                </label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="BS in computer saince"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.degree ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.degree && (
                  <p className="mt-1 text-sm text-red-500">{errors.degree}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications *
                </label>
                <input
                  type="text"
                  value={formData.certifications.join(", ")}
                  onChange={(e) => handleArrayInputChange(e, "certifications")}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.certifications ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Google Cloud,AWS"
                />
                {errors.certifications && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.certifications}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Courses *
                </label>
                <input
                  type="text"
                  value={formData.previous_courses.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange(e, "previous_courses")
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.previous_courses
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="React + Redux , MERN stack"
                />
                {errors.previous_courses && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.previous_courses}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Background *
                </label>
                <input
                  type="text"
                  name="education_background"
                  value={formData.education_background}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.education_background
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Computer Science"
                />
                {errors.education_background && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.education_background}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teaching Style *
              </label>
              <input
                type="text"
                name="teaching_style"
                value={formData.teaching_style}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.teaching_style ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Interactive, Project-based"
              />
              {errors.teaching_style && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.teaching_style}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Review Application
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <ReviewComponent />

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Edit Information
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoadingUpload}
                className={`px-6 py-3 flex items-center space-x-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting || isLoadingUpload
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
                }`}
              >
                {isSubmitting || isLoadingUpload ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>
                      {isLoadingUpload ? "Uploading Image..." : "Submitting..."}
                    </span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeMentor;
