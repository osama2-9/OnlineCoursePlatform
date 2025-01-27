import express from "express";
import { checkRole } from "../middlewares/checkRole.js";
import {
  getAvliableQuizzes,
  getCompletedLessons,
  getCourseReviews,
  getCoursesProgress,
  getEnrolledCourseContent,
  getEnrolledInCourses,
  getPaymentsHistory,
  getQuizQuestions,
  markLessonsAsCompleted,
  startQuizAttempt,
  submitQuizAnswers,
  submitReview,
} from "../controllers/learnerController.js";
const learnerRoute = express.Router();

learnerRoute.get(
  "/get-enrolled-courses/:userId",
  checkRole("learner"),
  getEnrolledInCourses
);

learnerRoute.get(
  "/get-payments-history/:userId",
  checkRole("learner"),
  getPaymentsHistory
);

learnerRoute.get(
  "/get-lessons/:enrollmentId/course/:courseId",
  checkRole("learner"),
  getEnrolledCourseContent
);
learnerRoute.get(
  "/get-completed-lessons/user/:userId/course/:courseId",
  checkRole("learner"),
  getCompletedLessons
);
learnerRoute.post(
  "/mark-complete-lesson",
  checkRole("learner"),
  markLessonsAsCompleted
);

learnerRoute.get(
  "/course-progress/:userId",
  checkRole("learner"),
  getCoursesProgress
);
learnerRoute.get(
  "/get-avliable-quizzes/:userId",
  checkRole("learner"),
  getAvliableQuizzes
);
learnerRoute.post("/start-quiz", checkRole("learner"), startQuizAttempt);

learnerRoute.get(
  "/quiz/:quizId/c/:courseId/u/:userId/attempt/:attemptId/e/:enrollmentId",
  checkRole("learner"),
  getQuizQuestions
);

learnerRoute.post("/submit-quiz", checkRole("learner"), submitQuizAnswers);
learnerRoute.get(
  "/get-courses-toReview/:userId",
  checkRole("learner"),
  getCourseReviews
);
learnerRoute.post('/submit-review' , checkRole("learner") ,submitReview)
export default learnerRoute;
