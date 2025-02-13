import { sendApprovmentMail } from "../emails/ApprovedEmail.js";
import { prisma } from "../prisma/prismaClint.js";
export const sendApplication = async (req, res) => {
  try {
    const inputs = req.body;
    const email = req.body.email;
    const checkSameEmail = await prisma.instructorsApplications.findFirst({
      where: {
        email: email,
      },
    });

    if (checkSameEmail) {
      return res.status(400).json({
        error: "This email already used",
      });
    }

    if (
      !inputs.full_name ||
      !email ||
      !inputs.phone_number ||
      !inputs.expertise_area ||
      !inputs.years_of_experience ||
      !inputs.institution ||
      !inputs.degree
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const newApplication = await prisma.instructorsApplications.create({
      data: {
        full_name: inputs.full_name,
        email: email,
        phone_number: inputs.phone_number,
        bio: inputs.bio || "",
        profile_picture_url: inputs.profile_picture_url || "",
        expertise_area: Array.isArray(inputs.expertise_area)
          ? inputs.expertise_area
          : [inputs.expertise_area],
        certifications: Array.isArray(inputs.certifications)
          ? inputs.certifications
          : inputs.certifications
          ? [inputs.certifications]
          : [],
        years_of_experience: Number(inputs.years_of_experience),
        education_background: inputs.education_background || "",
        institution: inputs.institution,
        degree: inputs.degree,
        previous_courses: Array.isArray(inputs.previous_courses)
          ? inputs.previous_courses
          : inputs.previous_courses
          ? [inputs.previous_courses]
          : [],
        teaching_style: inputs.teaching_style || "",
        language_skills: Array.isArray(inputs.language_skills)
          ? inputs.language_skills
          : inputs.language_skills
          ? [inputs.language_skills]
          : [],
        preferred_schedule: inputs.preferred_schedule || "",
        application_status: "pending",
        submitted_at: new Date(),
      },
    });

    if (!newApplication) {
      return res.status(400).json({
        error: "Error while sending the application",
      });
    }

    return res.status(201).json({
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Application submission error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getApplications = async (req, res) => {
  try {
    const { userId } = req.params;

    const userIdInt = parseInt(userId);

    if (!userId || isNaN(userIdInt)) {
      return res.status(400).json({
        error: "User ID is required and must be a valid number",
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        error: "Page number must be a positive integer",
      });
    }

    if (isNaN(pageSize) || pageSize <= 0) {
      return res.status(400).json({
        error: "Limit must be a positive integer",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: userIdInt,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(401).json({
        error: "Unauthorized: Only admins can access this resource",
      });
    }

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const applications = await prisma.instructorsApplications.findMany({
      take: take,
      skip: skip,
      orderBy: {
        submitted_at: "desc",
      },
    });

    const totalApplications = await prisma.instructorsApplications.count();

    return res.status(200).json({
      applications,
      totalPages: Math.ceil(totalApplications / pageSize),
      currentPage: pageNumber,
      totalItems: totalApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error.message);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { application_status, userId } = req.body;

    if (!applicationId || !application_status || !userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const isAdmin = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        role: true,
      },
    });

    if (isAdmin.role !== "admin") {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    const application = await prisma.instructorsApplications.findUnique({
      where: {
        application_id: parseInt(applicationId),
      },
      select: {
        application_status: true,
        email: true,
      },
    });
    if (!application) {
      return res.status(404).json({
        error: "No Applicatinos found ",
      });
    }

    const update = await prisma.instructorsApplications.update({
      where: {
        application_id: parseInt(applicationId),
      },
      data: {
        application_status: application_status,
      },
    });

    if (!update) {
      return res.status(400).json({
        error: "Error while try to update the application",
      });
    }
    await sendApprovmentMail(application.email);
    return res.status(200).json({
      message: "Application Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
