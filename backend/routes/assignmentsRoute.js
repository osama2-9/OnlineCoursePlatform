import { createAssignment, deleteAssignment, getCourseAssignments, getLearnerAssignments, getLearnersSubmitedAssignment, submitAssignment, submitReview, updateAssignment } from "../controllers/assignmentsController.js";
import express from 'express'
import { checkRole } from "../middlewares/checkRole.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";


const assignmentsRoute = express.Router();

assignmentsRoute.post("/create-assignment",checkRole("instructor") ,createAssignment);
assignmentsRoute.get("/get-all-assignments",checkRole("instructor") ,getCourseAssignments);
assignmentsRoute.get("/get-assignments",protectedRoute ,getLearnerAssignments);
assignmentsRoute.post("/submit-assignment",protectedRoute ,submitAssignment);
assignmentsRoute.get("/get-submissions",checkRole("instructor") ,getLearnersSubmitedAssignment);
assignmentsRoute.post("/submit-review",checkRole("instructor") ,submitReview);
assignmentsRoute.delete("/delete-assignment/:assignment_id",checkRole("instructor") ,deleteAssignment);
assignmentsRoute.put("/update-assignment/:assignment_id",checkRole("instructor") ,updateAssignment);

export default assignmentsRoute;


