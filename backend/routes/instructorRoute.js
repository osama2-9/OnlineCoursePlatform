import express from "express";
import {
  aiSuggestionsQuestion,
  coursesStats,
  createQuestion,
  createQuiz,
  deleteLesson,
  deleteQuestion,
  deleteQuiz,
  getAnalysticsForCharts,
  getEnrollmentData,
  getInstructorCourses,
  getLearnerScores,
  getLessonsByCourseId,
  getMyContentRequests,
  getQuizzes,
  getStudentProgress,
  getUserAnswers,
  getUsersAttempts,
  reviewQuiz,
  sendEmail,
  toggleQuizPublish,
  updateAttemptScore,
  updateMyCourse,
  updateQuestion,
  updateQuizInformations,
} from "../controllers/instructorController.js";
import { checkRole } from "../middlewares/checkRole.js";
const instructorRoute = express.Router();

instructorRoute.get(
  "/instructor-courses/:instructorId",
  checkRole("instructor"),
  getInstructorCourses
);

instructorRoute.get(
  "/get-course-lessons/:instructorId/course/:courseId",
  checkRole("instructor"),
  getLessonsByCourseId
);

instructorRoute.get(
  "/instructor-courses/:instructorId",
  checkRole("instructor"),
  getInstructorCourses
);

instructorRoute.get(
  "/instructor-courses-enrollments/:instructorId",
  checkRole("instructor"),
  getEnrollmentData
);
instructorRoute.put("/update-course", checkRole("instructor"), updateMyCourse);
instructorRoute.get(
  "/get-analystic/:instructorId",
  checkRole("instructor"),
  getAnalysticsForCharts
);
instructorRoute.get(
  "/get-students-progress",
  checkRole("instructor"),
  getStudentProgress
);
instructorRoute.post("/create-quiz", checkRole("instructor"), createQuiz);
instructorRoute.post(
  "/create-question",
  checkRole("instructor"),
  createQuestion
);
instructorRoute.get(
  "/get-quizzes/:instructorId",
  checkRole("instructor"),
  getQuizzes
);

instructorRoute.get(
  "/review-quiz/:quizId/course/:courseId/instructor/:instructorId",
  checkRole("instructor"),
  reviewQuiz
);

instructorRoute.get(
  "/students-marks",
  checkRole("instructor"),
  getLearnerScores
);

instructorRoute.get(
  "/courses-stats",
  checkRole("instructor"),
  coursesStats
);

instructorRoute.delete(
  "/delete-question/:questionId/instrctor/:instructorId/quiz/:quizId/course/:courseId",
  checkRole("instructor"),
  deleteQuestion
);

instructorRoute.put(
  "/update-question",
  checkRole("instructor"),
  updateQuestion
);

instructorRoute.put(
  "/toggle-publish-quiz",
  checkRole("instructor"),
  toggleQuizPublish
);

instructorRoute.get(
  "/get-quizzes-attempts/:instructorId",
  checkRole("instructor"),
  getUsersAttempts
);

instructorRoute.get(
  "/get-user-answers/:attemptId/quiz/:quizId/course/:courseId/ins/:instructorId",
  checkRole("instructor"),
  getUserAnswers
);
instructorRoute.post(
  "/update-scores",
  checkRole("instructor"),
  updateAttemptScore
);
instructorRoute.post(
  "/get-ai-suggestions",
  checkRole("instructor"),
  aiSuggestionsQuestion
);
instructorRoute.put(
  "/update-quiz",
  checkRole("instructor"),
  updateQuizInformations
);

instructorRoute.post(
  "/send-email",
  checkRole(["instructor", "admin"]),
  sendEmail
);
instructorRoute.get(
  "/get-my-content-requests",
  checkRole(["instructor", "admin"]),
  getMyContentRequests
);

instructorRoute.delete("/delete-lesson", checkRole("instructor"), deleteLesson);

instructorRoute.delete(
  "/delete-quiz/:quizId/course/:courseId",
  checkRole("instructor"),
  deleteQuiz
);

export default instructorRoute;
