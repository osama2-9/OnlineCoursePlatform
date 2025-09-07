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
      start_date,
      end_date,
      required_marks,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !instructor_id ||
      !course_img ||
      !learn_outcome ||
      !category ||
      !start_date ||
      !end_date ||
      !required_marks
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
    const img = await cloudinary.uploader.upload(course_img, {
      resource_type: "auto",
    });
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
        start_date: start_date,
        end_date: end_date,
        required_marks: required_marks,
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

    let whereClause = { is_published: true };

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
          reviews: {
            select: {
              rating: true,
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

    const coursesWithAvgRating = courses
      .map((course) => {
        const avgRating =
          course.reviews.length > 0
            ? (
                course.reviews.reduce((sum, review) => sum + review.rating, 0) /
                course.reviews.length
              ).toFixed(1)
            : "0.0";

        const { reviews, ...courseWithoutReviews } = course;
        return {
          ...courseWithoutReviews,
          avgRating,
        };
      })
      .sort((a, b) => {
        a.avgRating = Number(a.avgRating);
        b.avgRating = Number(b.avgRating);
        return b.avgRating - a.avgRating;
      });

    const totalPages = Math.ceil(totalCourses / pageSize);
    const hasNext = page < totalPages

    return res.status(200).json({
      courses: coursesWithAvgRating,
      pagination: {
        totalCourses,
        totalPages,
        currentPage: page,
        pageSize,
        hasNext
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
      start_date,
      end_date,
      required_marks,
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
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(required_marks && { required_marks }),
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
        is_published: true,
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
        start_date: true,
        end_date: true,
        reviews: {
          select: {
            rating: true,
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
            is_lesson_approved: true,
          },

          orderBy: {
            lesson_order: "asc",
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({
        error: "No Content found",
      });
    }

    const avgRating =
      course.reviews.length > 0
        ? course.reviews
            .reduce((sum, review) => sum + review.rating, 0)
            .toFixed(1) / course.reviews.length
        : "0.0";

    const totalRating = course.reviews.length || 0;

    course.lessons = course.lessons
      .filter((les) => les.is_lesson_approved == true)
      .map((lessons) => {
        if (!lessons.is_free) {
          delete lessons.video_url;
          delete lessons.attachment;
        }
        return lessons;
      });
    const { reviews, ...courseWithoutReviews } = course;

    return res.status(200).json({
      course: {
        ...courseWithoutReviews,
        avgRating: avgRating.toString(),
        totalRating: totalRating,
      },
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
      select: {
        is_published: true,
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

    if (lessonCount === 0 && course.is_published == false) {
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

export const searchCourse = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        error: "search error",
      });
    }

    const courses = await prisma.courses.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        course_id: true,
        title: true,
        description: true,
        price: true,
        course_img: true,
        category: true,
        course_type: true,
        start_date: true,
        end_date: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        instructor: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        error: "No courses found",
      });
    }

    // Attach avgRating to each course and remove reviews
    const coursesWithAvgRating = courses.map((course) => {
      const avgRating =
        course.reviews.length > 0
          ? (
              course.reviews.reduce((sum, review) => sum + review.rating, 0) /
              course.reviews.length
            ).toFixed(1)
          : "0.0";
      const { reviews, ...courseWithoutReviews } = course;
      return {
        ...courseWithoutReviews,
        avgRating,
      };
    });

    return res.status(200).json({
      courses: coursesWithAvgRating,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
