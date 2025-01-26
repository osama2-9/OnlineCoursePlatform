import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../prisma/prismaClint.js";

const isHavePermession = async (course_id, instructor_id) => {
  const courseId = parseInt(course_id);
  const instructorId = parseInt(instructor_id);

  const course = await prisma.courses.findUnique({
    where: {
      course_id: courseId,
      instructor_id: instructorId,
    },
  });
  const userRole = await prisma.users.findUnique({
    where: {
      user_id: parseInt(instructor_id),
    },
  });
  if (userRole && userRole.role === "admin") {
    return true;
  }
  if (course) {
    return true;
  } else {
    throw new Error("You don't have permission to handle this course");
  }
};

export const createLesson = async (req, res) => {
  try {
    const {
      instructor_id,
      course_id,
      title,
      content,
      description,
      video_url,
      attachment,
      is_free,
      lesson_order,
    } = req.body;

    if (
      !instructor_id ||
      !course_id ||
      !title ||
      !content ||
      !description ||
      !video_url ||
      is_free === undefined ||
      !lesson_order
    ) {
      return res.status(400).json({
        error: "Please fill all required fields",
      });
    }

    await isHavePermession(course_id, instructor_id);

    const newLesson = await prisma.lessons.create({
      data: {
        course_id: parseInt(course_id),
        title: title,
        description: description,
        content: content,
        video_url: video_url,
        attachment: attachment,
        is_free: is_free,
        lesson_order: parseInt(lesson_order),
      },
    });

    if (newLesson) {
      return res.status(201).json({
        message: "New lesson added to your course",
      });
    } else {
      return res.status(400).json({
        error: "Error while trying to add lesson",
      });
    }
  } catch (error) {
    console.error(error);

    if (error.message === "You don't have permission to handle this course") {
      return res.status(401).json({
        error: error.message,
      });
    }

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const updateLesson = async (req, res) => {
  try {

    const {
      instructor_id,
      course_id,
      lesson_id,
      title,
      description,
      content,
      video_url,
      attachment,
      is_free,
    } = req.body.lessonToUpdate;

    await isHavePermession(course_id, instructor_id);
    const findLesson = await prisma.lessons.findUnique({
      where: {
        lesson_id: parseInt(lesson_id),
        course_id: parseInt(course_id),
      },
    });
    if (!findLesson) {
      return res.status(400).json({
        error: "No lesson found to update",
      });
    }

    const updateLesson = await prisma.lessons.update({
      where: { lesson_id: parseInt(lesson_id), course_id: parseInt(course_id) },
      data: {
        course_id: parseInt(course_id),
        title: title,
        description: description,
        content: content,
        video_url: video_url,
        attachment: attachment,
        is_free: is_free,
      },
    });
    if (updateLesson) {
      return res.status(200).json({
        message: "Lesson updated",
      });
    } else {
      return res.status(400).json({
        error: "Error while update the lesson",
      });
    }
  } catch (error) {
    if (error.message === "You don't have permission to handle this course") {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const deleteLesson = async (req, res) => {
  try {
    const { lesson_id, course_id, instructor_id } = req.params;
    if (!lesson_id) {
      return res.status(400).json({
        error: "Select a lesson to delete",
      });
    }
    await isHavePermession(course_id, instructor_id);
    const lessonId = parseInt(lesson_id);
    const deleteLesson = await prisma.lessons.delete({
      where: {
        lesson_id: lessonId,
      },
    });
    if (deleteLesson) {
      return res.status(200).json({
        message: "lesson deleted",
      });
    } else {
      return res.status(400).json({
        error: "Error while delete the lesson",
      });
    }
  } catch (error) {
    if (error.message === "You don't have permission to handle this course") {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { course_id, instructor_id } = req.params;
    if (!course_id || !instructor_id) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }
    await isHavePermession(course_id, instructor_id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        error: "Page and limit must be positive integers.",
      });
    }

    const skip = (page - 1) * limit;
    const take = limit;
    const courseId = parseInt(course_id);
    const lessons = await prisma.lessons.findMany({
      where: {
        course_id: courseId,
      },
      skip: skip,
      take: take,
      orderBy: {
        lesson_order: "asc",
      },
      include: {
        course: true,
      },
    });

    const totalLessons = await prisma.lessons.count();

    const totalPages = Math.ceil(totalLessons / limit);

    return res.status(200).json({
      lessons,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalLessons: totalLessons,
        limit: limit,
      },
    });
  } catch (error) {
    if (error.message === "You don't have permission to handle this course") {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const changeLessonAccess = async (req, res) => {
  try {
    const { lesson_id, course_id, instructor_id } = req.params;

    if (!lesson_id) {
      return res.status(400).json({
        error: "Please provide a lesson ID to change the access status.",
      });
    }
    await isHavePermession(course_id, instructor_id);
    const lessonId = parseInt(lesson_id);
    const lesson = await prisma.lessons.findUnique({
      where: { lesson_id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found.",
      });
    }

    const updatedLesson = await prisma.lessons.update({
      where: { lesson_id: lessonId },
      data: {
        is_free: !lesson.is_free,
      },
    });

    return res.status(200).json({
      message: `Lesson access status updated successfully. Now it is ${
        updatedLesson.is_free ? "free" : "paid"
      }.`,
    });
  } catch (error) {
    if (error.message === "You don't have permission to handle this course") {
      return res.status(401).json({
        error: error.message,
      });
    }
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while updating the lesson access.",
    });
  }
};
export const updateOrder = async (req, res) => {
  try {
    const { lessons } = req.body;

    if (!lessons || !Array.isArray(lessons)) {
      return res.status(400).json({
        error: "Invalid request format. Expected an array of lessons.",
      });
    }

    const updates = await prisma.$transaction(
      lessons.map((lesson) =>
        prisma.lessons.update({
          where: {
            lesson_id: parseInt(lesson.lesson_id),
          },
          data: {
            lesson_order: parseInt(lesson.lesson_order),
          },
        })
      )
    );

    if (updates) {
      return res.status(200).json({
        message: "Lesson order updated successfully!",
      });
    } else {
      return res.status(400).json({
        error: "Failed to update lesson order.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
