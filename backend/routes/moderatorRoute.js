import express from "express";
import {
  approveRequest,
  getApprovleRequestContent,
  getSelectedContentDetails,
  rejecetRequest,
} from "../controllers/moderatorController.js";
import { checkRole } from "../middlewares/checkRole.js";
const moderatorRoute = express.Router();

moderatorRoute.get(
  "/get-content",
  checkRole(["moderator"]),
  getApprovleRequestContent
);
moderatorRoute.get(
  "/get-content-details",
  checkRole(["moderator"]),
  getSelectedContentDetails
);
moderatorRoute.post("/approve", checkRole(["moderator"]), approveRequest);
moderatorRoute.post("/reject", checkRole(["moderator"]), rejecetRequest);

export default moderatorRoute;
