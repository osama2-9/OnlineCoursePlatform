import express from "express";
import { checkRole } from "../middlewares/checkRole.js";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  searchCourse,
  updateCourse,
  updatePublishStatus,
} from "../controllers/courseController.js";

const courseRoute = express.Router();

courseRoute.post("/create-course", checkRole("admin"), createCourse);
courseRoute.get("/get-courses", getCourses);
courseRoute.put("/update-course", checkRole("admin"), updateCourse);
courseRoute.delete(
  "/delete-course/:course_Id",
  checkRole("admin"),
  deleteCourse
);
courseRoute.get("/course-details/:course_Id", getCourseById);
courseRoute.put(
  "/update-publish-status",
  checkRole("admin"),
  updatePublishStatus
);

courseRoute.get('/search',searchCourse)
export default courseRoute;
