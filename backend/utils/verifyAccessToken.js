import { prisma } from "../prisma/prismaClint.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const verifyAccessToken = async (userId, courseId, enrollmentId) => {
  try {
    const enrollment = await prisma.enrollments.findUnique({
      where: {
        enrollment_id: parseInt(enrollmentId),
      },
      select: {
        access_token: true,
        user_id: true,
        course_id: true,
      },
    });

    if (!enrollment) {
      throw new Error("No enrollment found");
    }

    const token = enrollment.access_token;

    if (!token) {
      throw new Error("Access token not found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (
      decoded.userId != userId ||
      decoded.courseId != courseId ||
      decoded.enrollmentId != enrollmentId
    ) {
      throw new Error("Invalid token payload");
    }

    return { isValid: true, message: "Token is valid" };
  } catch (error) {
    console.error("Error verifying access token:", error.message);
    return { isValid: false, message: error.message };
  }
};
