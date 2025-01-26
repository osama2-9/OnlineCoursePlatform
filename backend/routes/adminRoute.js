import express from "express";
import { checkRole } from "../middlewares/checkRole.js";
import {
  accountActivation,
  createNewUser,
  deleteUser,
  getAdminDashboardSummary,
  getAnalystics,
  getInstructors,
  getQuizzes,
  getTopEnrolledCourses,
  getUsers,
  searchAboutUser,
  updateUser,
} from "../controllers/adminController.js";

const adminRoute = express.Router();

adminRoute.post("/create-user", checkRole("admin"), createNewUser);
adminRoute.put("/update-user", checkRole("admin"), updateUser);
adminRoute.delete("/delete-user/:user_id", checkRole("admin"), deleteUser);
adminRoute.get("/get-users", checkRole("admin"), getUsers);
adminRoute.put("/account-status", checkRole("admin"), accountActivation);
adminRoute.get(
  "/dashboard-summary",
  checkRole("admin"),
  getAdminDashboardSummary
);
adminRoute.get("/get-instructors", checkRole("admin"), getInstructors);
adminRoute.get("/search", checkRole("admin"), searchAboutUser);
adminRoute.get("/top-enrolled-courses", checkRole("admin"), getTopEnrolledCourses);
adminRoute.get('/get-quizzes/:userId' ,checkRole("admin") ,getQuizzes)
adminRoute.get('/analystics/:userId' ,checkRole('admin') ,getAnalystics)

export default adminRoute;
