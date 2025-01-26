import { prisma } from "../prisma/prismaClint.js";

const createEntrollment = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (!course_id) {
      return res.status(400).json({
        error: "Course not found",
      });
    }

    const courseType = await prisma.courses.findUnique({
      where: {
        course_id: course_id,
      },
    });
    if (!courseType) {
      return res.status(400).json({
        error: "Course not found",
      });
    }

    if (courseType.course_type === "free") {
      const newEnroll = await prisma.enrollments.create({
        data: {
          course_id: course_id,
          user_id: user_id,
        },
      });
      if (!newEnroll) {
        return res.status(400).json({
          error: "error while try to enroll",
        });
      } else {
        return res.status(201).json({
          message: "enrollment success",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const enrollAfterPay = async (userId, courseId) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) {
      console.log("error on params");
    }
    const newEnrollment = await prisma.enrollments.create({
      data: {
        user_id: user_id,
        course_id: course_id,
        access_granted: true,
        status: "active",
      },
    });

    if (newEnrollment) {
      console.log("enroll success");
    } else {
      console.log("enroll falid");
    }
  } catch (error) {
    console.log("server error");
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalEnrollments = await prisma.enrollments.count();
    const enrollments = await prisma.enrollments.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        enrollment_id: "desc",
      },
      include: {
        user: {
          select: {
            full_name: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });
    return res.status(200).json({
      enrollments,
      currentPage: page,
      totalPages: Math.ceil(totalEnrollments / limit),
      totalEnrollments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateEnrollment = async (req, res) => {
  try {
    console.log(req.body);
    
    const { enrollmentId, status, access_granted } = req.body;
    if (!enrollmentId) {
      return res.status(400).json({
        errro: "Enrollment Id required",
      });
    }

    const enrollment = await prisma.enrollments.findUnique({
      where: {
        enrollment_id: parseInt(enrollmentId),
      },
      select: {
        status: true,
        access_granted: true,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        error: "Enrollment  not found",
      });
    }

    const update = await prisma.enrollments.update({
      where: {
        enrollment_id: parseInt(enrollmentId),
      },
      data: {
        access_granted: access_granted ,
        status: status || enrollment.status,
      },
    });

    if (update) {
      return res.status(200).json({
        message: "Enrollment data updated",
      });
    } else {
      return res.status(400).json({
        error: "Erorr while try to update enrollment",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:"Internal server error"
    })
    
  }
};


