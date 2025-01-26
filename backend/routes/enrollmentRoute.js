import express from "express";
import {
  getEnrollments,
  updateEnrollment,
} from "../controllers/enrollmentController.js";
import { checkRole } from "../middlewares/checkRole.js";
const enrollmentRoute = express.Router();

enrollmentRoute.get("/get-enrollments", checkRole("admin"), getEnrollments);
enrollmentRoute.put("/update-enrollment", checkRole("admin"), updateEnrollment);

export default enrollmentRoute;
