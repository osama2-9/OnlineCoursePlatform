import express from "express";
import {
  getApplications,
  sendApplication,
  updateStatus,
} from "../controllers/applicationsContoller.js";
import { checkRole } from "../middlewares/checkRole.js";
const applicationsRoute = express.Router();

applicationsRoute.post("/send-application", sendApplication);
applicationsRoute.get("/get/:userId", checkRole("admin"), getApplications);
applicationsRoute.put(
  "/update-status/:applicationId",
  checkRole("admin"),
  updateStatus
);

export default applicationsRoute;
