import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CoursePage } from "./pages/CoursePage";
import { Login } from "./pages/Login";
import { Toaster } from "react-hot-toast";
import { Signup } from "./pages/Signup";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import ProtectAdminRoute from "./components/admin/ProtectAdminRoute";
import { useAuth } from "./hooks/useAuth";
import { ShowUsers } from "./pages/admin/ShowUsers";
import { AddUser } from "./pages/admin/AddUser";
import { ShowCourses } from "./pages/admin/ShowCourses";
import { AddCourse } from "./pages/admin/AddCourse";
import SuccessPayment from "./pages/SuccessPayment";
import { CancelPayment } from "./pages/CancelPayment";
import { ShowPayments } from "./pages/admin/ShowPayments";
import { ShowEnrollments } from "./pages/admin/ShowEnrollments";
import { AddLesson } from "./pages/admin/AddLesson";
import { ShowLessons } from "./pages/admin/ShowLessons";
import ProtectLearnerRoute from "./components/learnre/ProtectedLearnerRoute";
import { LearnerDashboard } from "./pages/learner/LearnerDashboard";
import CoursePracticePage from "./pages/learner/CoursePracticePage";
import { MyCourses } from "./pages/learner/MyCourses";
import { MyPayments } from "./pages/learner/MyPayments";
import Progress from "./pages/learner/Progress";
import ProtectedInstractourRoute from "./components/instrctor/ProtectedInstrctorRoute";
import { InstructorDashboard } from "./pages/instructor/InstrctorDashboard";
import { ShowEnrolledLearners } from "./pages/instructor/ShowEnrolledLearners";
import { Analystic } from "./pages/instructor/Analystic";
import { Quizzes } from "./pages/instructor/Quizzes";
import { CreateQuiz } from "./pages/instructor/CreateQuiz";
import { AddQuestions } from "./pages/instructor/AddQuestions";
import { ReviewQuiz } from "./pages/instructor/ReviewQuiz";
import { UpdateQuestion } from "./pages/instructor/UpdateQuestion";
import { QuizPage } from "./pages/learner/QuizPage";
import QuizzesAttempts from "./pages/instructor/QuizzesAttempts";
import { ReviewAttempt } from "./pages/instructor/ReviewAttempt";
import { NotFound } from "./pages/NotFound";
import { ShowQuizzes } from "./pages/admin/ShowQuizzes";
import { AdminAnalystic } from "./pages/admin/Analystic";
import { ShowCourseLessons } from "./pages/instructor/ShowCourseLessons";
import { AddLessonToCourse } from "./pages/instructor/AddLessonToCourse";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import SetNewPassword from "./pages/SetNewPassword";
import { CourseReview } from "./pages/learner/CourseReview";
import { Reviews } from "./pages/admin/Reviews";
import { ExploreCoursesPage } from "./pages/ExploreCoursesPage";
import { LearnerSettings } from "./pages/LearnerSettings";
import { AccountSetting } from "./pages/admin/AccountSetting";
import ActiveAccountRequest from "./pages/ActiveAccountRequest";
import { ActiveAccount } from "./pages/ActiveAccount";
import InstractourSettings from "./pages/instructor/InstractourSettings";
import { UpdateQuiz } from "./pages/instructor/UpdateQuiz";
import BecomeMentor from "./pages/BecomeAnInstractour";
import { InstructorApplications } from "./pages/admin/InstructorApplications";
import Feed from "./pages/Feed";
import CreateArticle from "./pages/CreateArticle";
import ArticlePage from "./pages/ArticalPage";
import BookmarkedArticles from "./pages/BookmarkedArticles";
import ShowAssignments from "./pages/instructor/ShowAssignments";
import { ShowInstractourCourses } from "./pages/instructor/ShowCourses";
import CreateAssignment from "./pages/instructor/CreateAssignment";
import AssignmentSubmissionPage from "./pages/learner/AssignmentSubmissionPage";
import GetSubmittiedAssignments from "./pages/instructor/GetSubmittiedAssignments";
import SupportPage from "./pages/SupportPage";
import SupportDashboard from "./pages/support/SupportDashboard";
import ProtectedSupportRoute from "./pages/support/ProtectedSupportRoute";
import UsersChatPage from "./pages/support/UsersChatPage";
import { GoogleAuth } from "./pages/GoogleAuth";
import Privacy from "./pages/Privecy";
import ProtectedModeratorRoute from "./components/moderator/ProtectedModeratorRoute";
import ContentModeratorDashboard from "./pages/moderator/ModeratorDashboard";
import PublishContentRequests from "./pages/admin/PublishContentRequests";
import MyContentRequests from "./pages/instructor/MyContentRequests";
import SearchPage from "./pages/SearchPage";
import { Certifications } from "./pages/learner/Certifications";
import { CertificationsRequests } from "./pages/instructor/CertificationsRequests";
import CertificateVerification from "./pages/VerifyCertification";
import StudentsProgress from "./pages/instructor/StudentsProgress";
import  LearnersScores  from "./pages/instructor/LearnersScores";
function App() {
  const { checkAuth } = useAuth();
  checkAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/auth/google" element={<GoogleAuth />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/become-an-instractour" element={<BecomeMentor />} />
        <Route path="/explore" element={<ExploreCoursesPage />} />
        <Route path="/forgot-password" element={<ResetPasswordRequest />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/articels" element={<Feed />} />
        <Route path="/bookmarks" element={<BookmarkedArticles />} />
        <Route path="/articels/create" element={<CreateArticle />} />
        <Route path="/articels/read/:articalId" element={<ArticlePage />} />
        <Route
          path="/active-account-request"
          element={<ActiveAccountRequest />}
        />
        <Route path="/active-account" element={<ActiveAccount />} />
        <Route
          path="/learner/dashboard"
          element={<ProtectLearnerRoute element={<LearnerDashboard />} />}
        />
        <Route
          path="/learner/course/practice/:enrollmentId/course/:courseId"
          element={<ProtectLearnerRoute element={<CoursePracticePage />} />}
        />
        <Route
          path="/learner/courses/show"
          element={<ProtectLearnerRoute element={<MyCourses />} />}
        />
        <Route
          path="/learner/progress"
          element={<ProtectLearnerRoute element={<Progress />} />}
        />
        <Route
          path="/learner/payments"
          element={<ProtectLearnerRoute element={<MyPayments />} />}
        />
        <Route
          path="/learner/course/review"
          element={<ProtectLearnerRoute element={<CourseReview />} />}
        />
        <Route
          path="/learner/account/settings"
          element={<ProtectLearnerRoute element={<LearnerSettings />} />}
        />
        <Route
          path="/quiz/:quizId/course/:courseId/a/:attemptId/e/:enrollmentId"
          element={<ProtectLearnerRoute element={<QuizPage />} />}
        />
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedInstractourRoute element={<InstructorDashboard />} />
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedInstractourRoute element={<ShowInstractourCourses />} />
          }
        />
        <Route
          path="/instructor/courses/:courseId/lessons"
          element={
            <ProtectedInstractourRoute element={<ShowCourseLessons />} />
          }
        />
        <Route
          path="/instructor/courses/:courseId/add-lesson/:instructorId"
          element={
            <ProtectedInstractourRoute element={<AddLessonToCourse />} />
          }
        />
        <Route
          path="/instructor/learners"
          element={
            <ProtectedInstractourRoute element={<ShowEnrolledLearners />} />
          }
        />
        <Route
          path="/instructor/analytics"
          element={<ProtectedInstractourRoute element={<Analystic />} />}
        />
        <Route
          path="/instructor/content/requests"
          element={
            <ProtectedInstractourRoute element={<MyContentRequests />} />
          }
        />
        <Route
          path="/instructor/quizess"
          element={<ProtectedInstractourRoute element={<Quizzes />} />}
        />

        <Route
          path="/instructor/courses/:courseId/assignments"
          element={<ProtectedInstractourRoute element={<ShowAssignments />} />}
        />
        <Route
          path="/instructor/assignments/create"
          element={<ProtectedInstractourRoute element={<CreateAssignment />} />}
        />
        <Route
          path="/learner/assignments/submission/:assignmentId/"
          element={
            <ProtectLearnerRoute element={<AssignmentSubmissionPage />} />
          }
        />
        <Route
          path="/learner/certificates"
          element={<ProtectLearnerRoute element={<Certifications />} />}
        />
        <Route
          path="/instructor/assignments/submissions/:assignmentId/:courseId/:courseTitle"
          element={
            <ProtectedInstractourRoute element={<GetSubmittiedAssignments />} />
          }
        />
        <Route
          path="/instructor/update-quiz"
          element={<ProtectedInstractourRoute element={<UpdateQuiz />} />}
        />
        <Route
          path="/instructor/quizzes/attempts"
          element={<ProtectedInstractourRoute element={<QuizzesAttempts />} />}
        />
        <Route
          path="/instructor/review/:attemptId"
          element={<ProtectedInstractourRoute element={<ReviewAttempt />} />}
        />
        <Route
          path="/instructor/create-quiz"
          element={<ProtectedInstractourRoute element={<CreateQuiz />} />}
        />
        <Route
          path="/instructor/add-questions/:quizId/quiz/:quizname/c/:coursename/cid/:courseId"
          element={<ProtectedInstractourRoute element={<AddQuestions />} />}
        />

        <Route
          path="/instructor/review-quiz/:quizId/course/:courseId"
          element={<ProtectedInstractourRoute element={<ReviewQuiz />} />}
        />

        <Route
          path="/instructor/update-question/:questionId/course/:courseId"
          element={<ProtectedInstractourRoute element={<UpdateQuestion />} />}
        />
        <Route
          path="/instructor/certifications"
          element={
            <ProtectedInstractourRoute element={<CertificationsRequests />} />
          }
        />

        <Route
          path="/instructor/students-progress"
          element={<ProtectedInstractourRoute element={<StudentsProgress />} />}
        />
        <Route
          path="/instructor/learners-scores"
          element={<ProtectedInstractourRoute element={<LearnersScores />} />}
        />

        <Route
          path="/instructor/settings"
          element={
            <ProtectedInstractourRoute element={<InstractourSettings />} />
          }
        />
        <Route
          path="/admin/dashboard"
          element={<ProtectAdminRoute element={<AdminDashboard />} />}
        />
        <Route
          path="/admin/users/show"
          element={<ProtectAdminRoute element={<ShowUsers />} />}
        />
        <Route
          path="/admin/users/add"
          element={<ProtectAdminRoute element={<AddUser />} />}
        />
        <Route
          path="/admin/courses/show"
          element={<ProtectAdminRoute element={<ShowCourses />} />}
        />
        <Route
          path="/admin/courses/add"
          element={<ProtectAdminRoute element={<AddCourse />} />}
        />
        <Route
          path="/admin/payments/show"
          element={<ProtectAdminRoute element={<ShowPayments />} />}
        />
        <Route
          path="/admin/quizzes/show"
          element={<ProtectAdminRoute element={<ShowQuizzes />} />}
        />
        <Route
          path="/admin/enrollments/show"
          element={<ProtectAdminRoute element={<ShowEnrollments />} />}
        />
        <Route
          path="/admin/courses/:courseId/instractor/:instructorId/add-lessons"
          element={<ProtectAdminRoute element={<AddLesson />} />}
        />
        <Route
          path="/admin/courses/:courseId/instructor/:instructorId/show-lessons/:courseName"
          element={<ProtectAdminRoute element={<ShowLessons />} />}
        />
        <Route
          path="/admin/analystics"
          element={<ProtectAdminRoute element={<AdminAnalystic />} />}
        />
        <Route
          path="/admin/applications"
          element={<ProtectAdminRoute element={<InstructorApplications />} />}
        />
        <Route
          path="/admin/website/content"
          element={<ProtectAdminRoute element={<PublishContentRequests />} />}
        />

        <Route
          path="/admin/reviews"
          element={<ProtectAdminRoute element={<Reviews />} />}
        />
        <Route
          path="/admin/settings/account"
          element={<ProtectAdminRoute element={<AccountSetting />} />}
        />

        <Route
          path="/support/dashboard"
          element={<ProtectedSupportRoute element={<SupportDashboard />} />}
        />
        <Route path="/support/users/chat" element={<UsersChatPage />} />

        <Route
          path="/moderator/dashboard"
          element={
            <ProtectedModeratorRoute element={<ContentModeratorDashboard />} />
          }
        ></Route>
        <Route
          path="/certification-verification"
          element={<CertificateVerification />}
        />
        <Route path="/course-page/:course_id" element={<CoursePage />} />
        <Route path="/payment/success" element={<SuccessPayment />} />
        <Route path="/payment/cancel" element={<CancelPayment />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
