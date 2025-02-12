import { prisma } from "../prisma/prismaClint.js";
import { v2 as cloudinary } from "cloudinary";

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

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      instructor_id,
      course_img,
      learn_outcome,
      category,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !instructor_id ||
      !course_img ||
      !learn_outcome ||
      !category
    ) {
      return res.status(400).json({
        error: "Please fill all inputs",
      });
    }
    const findSameTitleAndInstructorCourse = await prisma.courses.findFirst({
      where: {
        title: title,
        instructor_id: instructor_id,
      },
    });
    if (findSameTitleAndInstructorCourse) {
      return res.status(400).json({
        error: `Course named ${title} already exsit !`,
      });
    }
    const img = await cloudinary.uploader.upload(course_img);
    let imgUrl = img.secure_url;

    const newCourse = await prisma.courses.create({
      data: {
        title: title,
        description: description,
        price: parseInt(price),
        course_img: imgUrl,
        instructor_id: instructor_id,
        learning_outcomes: learn_outcome,
        category: category,
      },
    });

    if (newCourse) {
      return res.status(201).json({
        message: `Course ${title} created successfully`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const priceRange = req.query.priceRange || "";
    const sortField = req.query.sortField || "";
    const sortDirection = req.query.sortDirection || "asc";
    const skip = (page - 1) * pageSize;

    let whereClause = {};

    if (search) {
      whereClause = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { contains: search, mode: "insensitive" } },
          {
            instructor: {
              full_name: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    if (category) {
      whereClause = {
        ...whereClause,
        category: category,
      };
    }

    if (priceRange) {
      switch (priceRange) {
        case "free":
          whereClause = { ...whereClause, price: 0 };
          break;
        case "0-50":
          whereClause = { ...whereClause, price: { gte: 0, lte: 50 } };
          break;
        case "51-100":
          whereClause = { ...whereClause, price: { gte: 51, lte: 100 } };
          break;
        case "101+":
          whereClause = { ...whereClause, price: { gte: 101 } };
          break;
      }
    }

    let orderBy = {};
    if (sortField) {
      if (sortField === "instructor.full_name") {
        orderBy = {
          instructor: {
            full_name: sortDirection,
          },
        };
      } else {
        orderBy = {
          [sortField]: sortDirection,
        };
      }
    }

    const [courses, totalCourses] = await Promise.all([
      prisma.courses.findMany({
        where: whereClause,
        skip: skip,
        take: pageSize,
        orderBy: orderBy,
        select: {
          course_id: true,
          title: true,
          price: true,
          category: true,
          course_img: true,
          course_type: true,
          is_published: true,
          created_at: true,
          description: true,
          learning_outcomes: true,
          instructor: {
            select: {
              full_name: true,
              user_id: true,
            },
          },
        },
      }),
      prisma.courses.count({
        where: whereClause,
      }),
    ]);

    if (courses.length === 0) {
      return res.status(404).json({
        error: "No courses found",
      });
    }

    const totalPages = Math.ceil(totalCourses / pageSize);

    return res.status(200).json({
      courses,
      pagination: {
        totalCourses,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      price,
      category,
      instructor,
      courseType,
      learning_outcomes,
      is_published,
    } = req.body;

    let { course_img } = req.body;

    const isCourseAvailable = await prisma.courses.findUnique({
      where: {
        course_id: course_id,
      },
    });

    if (!isCourseAvailable) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    if (course_img && course_img !== isCourseAvailable.course_img) {
      try {
        if (isCourseAvailable.course_img?.includes("cloudinary")) {
          const publicId = isCourseAvailable.course_img
            .split("/")
            .pop()
            .split(".")[0];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.log("Error deleting old image:", deleteError);
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(course_img);
        if (!uploadResponse || !uploadResponse.secure_url) {
          return res.status(400).json({
            error: "Error uploading image",
          });
        }
        course_img = uploadResponse.secure_url;
      } catch (uploadError) {
        console.log("Error handling image:", uploadError);
        return res.status(400).json({
          error: "Error processing image upload",
        });
      }
    } else {
      course_img = isCourseAvailable.course_img;
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(category && { category }),
      ...(courseType && { course_type: courseType }),
      ...(learning_outcomes && { learning_outcomes }),
      ...(is_published !== undefined && { is_published }),
      ...(course_img && { course_img }),
      ...(instructor?.user_id && {
        instructor_id: parseInt(instructor.user_id),
      }),
    };

    const update = await prisma.courses.update({
      where: { course_id: course_id },
      data: updateData,
    });

    if (!update) {
      return res.status(400).json({
        error: "Error while updating course",
      });
    }

    return res.status(200).json({
      message: "Course data updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { course_Id } = req.params;
    if (!course_Id) {
      return res.status(400).json({
        error: "Please select a course to delete",
      });
    }

    const courseId = parseInt(course_Id);

    await prisma.lessons.deleteMany({
      where: { course_id: courseId },
    });

    const deleteCourse = await prisma.courses.delete({
      where: { course_id: courseId },
    });

    if (!deleteCourse) {
      return res.status(400).json({
        message: "Error while trying to delete course",
      });
    }

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { course_Id } = req.params;
    if (!course_Id) {
      return res.status(400).json({
        error: "Can't get course",
      });
    }

    const courseId = parseInt(course_Id);
    const course = await prisma.courses.findUnique({
      where: {
        course_id: courseId,
      },
      select: {
        course_id: true,
        title: true,
        description: true,
        price: true,
        course_img: true,
        category: true,
        course_type: true,
        learning_outcomes: true,
        instructor: {
          select: {
            full_name: true,
            user_id: true,
          },
        },
        lessons: {
          select: {
            lesson_id: true,
            title: true,
            description: true,
            content: true,
            video_url: true,
            is_free: true,
            attachment: true,
          },
          orderBy: {
            lesson_order: "asc",
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        error: "No course found",
      });
    }

    course.lessons = course.lessons.map((lesson) => {
      if (!lesson.is_free) {
        delete lesson.video_url;
        delete lesson.attachment;
      }
      return lesson;
    });

    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updatePublishStatus = async (req, res) => {
  try {
    const { course_id, instructor_id } = req.body;

    if (!course_id || !instructor_id) {
      return res.status(400).json({
        error: "Course ID or Instructor ID not provided",
      });
    }

    await isHavePermession(course_id, instructor_id);

    const course = await prisma.courses.findUnique({
      where: {
        course_id: parseInt(course_id),
      },
    });

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const lessonCount = await prisma.lessons.count({
      where: {
        course_id: parseInt(course_id),
      },
    });

    if (lessonCount === 0) {
      return res.status(400).json({
        error: "Cannot publish a course without lessons!",
      });
    }

    const updatedCourse = await prisma.courses.update({
      where: {
        course_id: parseInt(course_id),
      },
      data: {
        is_published: !course.is_published,
      },
    });

    return res.status(200).json({
      message: updatedCourse.is_published ? "Published" : "Unpublished",
    });
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
