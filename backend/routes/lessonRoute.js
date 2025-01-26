import express from "express";
import { checkRole } from "../middlewares/checkRole.js";
import {
  changeLessonAccess,
  createLesson,
  getLessons,
  updateLesson,
  deleteLesson,
  updateOrder,
} from "../controllers/lessonController.js";

const lessonRoute = express.Router();

lessonRoute.post(
  "/create-lesson",
  checkRole(["admin", "instructor"]),
  createLesson
);

lessonRoute.put(
  "/update-lesson",
  checkRole(["admin", "instructor"]),
  updateLesson
);

lessonRoute.get(
  "/get-lesson/:course_id/:instructor_id",
  checkRole(["admin", "instructor"]),
  getLessons
);

lessonRoute.delete(
  "/delete-lesson/:lesson_id/:course_id/:instructor_id",
  checkRole("instructor"),
  deleteLesson
);

lessonRoute.put(
  "/update-access/:lesson_id/:course_id/:instructor_id",
  checkRole("instructor"),
  changeLessonAccess
);
lessonRoute.put(
  "/update-order",
  checkRole(["admin", "instructor"]),
  updateOrder
);

export default lessonRoute;
