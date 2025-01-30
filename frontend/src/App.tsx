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
import { ShowInstractourCourses } from "./pages/instructor/ShowCourses";
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
import SetNewPassword from "./SetNewPassword";
import { CourseReview } from "./pages/learner/CourseReview";
import { Reviews } from "./pages/admin/Reviews";
import { ExploreCoursesPage } from "./pages/ExploreCoursesPage";
import { LearnerSettings } from "./pages/instructor/LearnerSettings";
import { AccountSetting } from "./pages/admin/AccountSetting";
function App() {
  const { checkAuth } = useAuth();
  checkAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<ExploreCoursesPage />} />
        <Route path="/forgot-password" element={<ResetPasswordRequest />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
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
          path="/instructor/quizess"
          element={<ProtectedInstractourRoute element={<Quizzes />} />}
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
          path="/instructor/add-questions/:quizId/quiz/:quizname/c/:coursename"
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
          path="/admin/reviews"
          element={<ProtectAdminRoute element={<Reviews />} />}
        />
        <Route
          path="/admin/settings/account"
          element={<ProtectAdminRoute element={<AccountSetting />} />}
        />
        <Route path="/course-page/:course_id" element={<CoursePage />} />
        <Route path="/payment/success" element={<SuccessPayment />} />
        <Route path="/payment/cancel" element={<CancelPayment />} />
      </Routes>
      <Toaster position="top-center" />
    </>
  );
}

export default App;
