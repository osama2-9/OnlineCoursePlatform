import { useEffect, useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  User,
  Mail,
  BookOpen,
  Calendar,
  ExternalLink,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { CertificationVerifyData } from "../types/Certifications";
import { useQuery } from "@tanstack/react-query";

interface CertificationVerifyResponse {
  certification: CertificationVerifyData | null;
}

export default function CertificateVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<CertificationVerifyData | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const response = await axios.get<CertificationVerifyResponse>(
        `${API}/auth/certification-verify`,
        {
          params: {
            code: verificationCode.trim(),
          },
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data.certification;
      if (data) {
        return data;
        setVerificationCode("");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while verifying the certificate.");
      throw error;
    } finally {
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["verify-certification", verificationCode],
    queryFn: handleVerify,
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setVerificationResult(data);
      setError("");
    }
  }, [data]);

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter a verification code");
      return;
    }

    setError("");
    setVerificationResult(null);

    try {
      await refetch();
    } catch (error) {
      setVerificationResult(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerification();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mt-10 text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your verification code to validate your certificate
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label
                htmlFor="verification-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Verification Code
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your verification code (e.g., abc-def-zxy)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                disabled={isLoading}
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <button
              onClick={handleVerification}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {verificationResult ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-800">
                      Certificate Verified
                    </h2>
                    <p className="text-green-600">
                      This certificate is authentic and valid
                    </p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Certificate Details */}
                  <div className="space-y-6">
                    {/* User Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Certificate Holder
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Name
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {verificationResult.user.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Email
                          </p>
                          <p className="text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {verificationResult.user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Issue Date
                          </p>
                          <p className="text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              verificationResult.issued_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Link */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        Certificate Document
                      </h3>
                      <a
                        href={verificationResult.certification_url}
                        target="_blank"
                        className="inline-flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Certificate PDF
                      </a>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div className="space-y-6">
                    <div className="bg-indigo-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        Course Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xl font-bold text-indigo-900">
                            {verificationResult.course.title}
                          </h4>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Description
                          </p>
                          <p className="text-gray-700 leading-relaxed">
                            {verificationResult.course.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-green-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Learning Outcomes
                      </h3>
                      <ul className="space-y-2">
                        {verificationResult.course.learning_outcomes?.map(
                          (outcome, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  Certificate Invalid
                </h2>
                <p className="text-red-600 text-lg">
                  The verification code you entered is not valid or the
                  certificate does not exist in our system.
                </p>
                <p className="text-gray-600 mt-4">
                  Please check your verification code and try again, or contact
                  the issuing institution for assistance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
