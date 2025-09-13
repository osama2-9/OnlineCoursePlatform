import express from "express";
import {
  getEnrollments,
  setAsEligibleToCertificate,
  updateEnrollment,
} from "../controllers/enrollmentController.js";
import { checkRole } from "../middlewares/checkRole.js";
const enrollmentRoute = express.Router();

enrollmentRoute.get("/get-enrollments", checkRole("admin"), getEnrollments);
enrollmentRoute.put("/update-enrollment", checkRole("admin"), updateEnrollment);
enrollmentRoute.post("/certificate-user", checkRole("instructor") ,setAsEligibleToCertificate);

export default enrollmentRoute;
