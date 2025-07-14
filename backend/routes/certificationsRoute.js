import express from 'express'
import { approvCertificationRequest, generateAndSendCertification, getCertificationsRequests, getCourseToCertificate, requestACertificate } from '../controllers/certificationsController.js';
import { checkRole } from '../middlewares/checkRole.js';

const certificationsRoute = express.Router()

certificationsRoute.get("/get-certifications-requests",checkRole("instructor") ,getCertificationsRequests);
certificationsRoute.post("/request-certificate",checkRole("learner") ,requestACertificate);
certificationsRoute.post("/approve-certification-request",checkRole("instructor") , approvCertificationRequest);
certificationsRoute.get("/get-course-to-certificate",checkRole("learner") , getCourseToCertificate);
certificationsRoute.post("/generate-approved-certifications",checkRole("instructor") , generateAndSendCertification);


export default certificationsRoute
