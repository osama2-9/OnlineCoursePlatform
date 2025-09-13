import { prisma } from "../prisma/prismaClint.js";

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
      select: {
        is_eligible_for_certificate: true,
        status: true,
        access_granted: true,
        enrollment_date: true,
        enrollment_id: true,
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
        access_granted: access_granted,
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
      error: "Internal server error",
    });
  }
};
export const setAsEligibleToCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    if (!enrollmentId) {
      return res.status(400).json({ error: "Enrollment Id is required" });
    }

    const updatedEnrollment = await prisma.enrollments.update({
      where: { enrollment_id: enrollmentId },
      data: { is_eligible_for_certificate: true },
    });

    if (updatedEnrollment) {
      return res.status(200).json({
        message: "Enrollment marked as eligible for certificate",
      });
    }
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
