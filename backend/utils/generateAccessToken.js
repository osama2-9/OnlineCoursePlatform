import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const genreateAccessCourseToken = (userId, enrollmentId, courseId) => {
  try {
    const payload = {
      userId: userId,
      enrollmentId: enrollmentId,
      courseId: courseId,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return token;
  } catch (error) {
    console.log(error);
    throw new Error("error while genreate the access token");
  }
};
