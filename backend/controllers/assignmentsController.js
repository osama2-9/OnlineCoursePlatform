import { prisma } from "../prisma/prismaClint.js";
import { newAssignmentNotification } from "../services/notifications.js";
import { scheduleAssignmentReminder } from "../services/schedule.js";

export async function getAssignmentesDeadlineDate(courseId) {
  try {
    if (!courseId) {
      throw new Error("No course Id found");
    }
    const dates = await prisma.assignments.findFirst({
      where: {
        course_id: courseId,
      },
      select: {
        end_date: true,
      },
      orderBy: {
        end_date: "asc",
      },
    });
    if (!dates) {
      throw new Error("Error fetching courses");
    }
    return dates.end_date;
  } catch (error) {
    throw new Error("error while get creation date");
  }
}

const isCourseAssigndToInstructor = async (course_id, instructor_id) => {
  try {
    const course = await prisma.courses.findUnique({
      where: {
        course_id: course_id,
        instructor_id: instructor_id,
      },
    });
    if (!course) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const createAssignment = async (req, res) => {
  try {
    const {
      course_id,
      instructor_id,
      title,
      description,
      start_date,
      end_date,
      points,
    } = req.body;

    if (
      !course_id ||
      !instructor_id ||
      !title ||
      !description ||
      !start_date ||
      !end_date ||
      !points
    ) {
      return res.status(400).json({ message: "Please fill all inputs" });
    }

    const isCourseAssigndToInstructorResult = await isCourseAssigndToInstructor(
      course_id,
      instructor_id
    );

    if (!isCourseAssigndToInstructorResult) {
      return res.status(400).json({ message: "You can't handle this course" });
    }

    const newAssignment = await prisma.assignments.create({
      data: {
        course_id: Number(course_id),
        instructor_id: Number(instructor_id),
        title: title,
        description: description,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        points: Number(points),
      },
    });

    if (!newAssignment) {
      return res.status(400).json({ message: "Failed to create assignment" });
    }

    if (newAssignment) {
      await scheduleAssignmentReminder(newAssignment.course_id);
    }
    res.status(201).json({ message: "Assignment created successfully" });

    try {
      await newAssignmentNotification(course_id);
    } catch (notificationError) {
      console.error(
        "Failed to send assignment notification:",
        notificationError
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCourseAssignments = async (req, res) => {
  try {
    const { course_id, instructor_id } = req.query;

    if (!course_id || !instructor_id) {
      return res
        .status(400)
        .json({ message: "Missing course_id or instructor_id" });
    }

    const courseIdInt = Number(course_id);
    const instructorIdInt = Number(instructor_id);

    const isCourseAssignedToInstructorResult =
      await isCourseAssigndToInstructor(courseIdInt, instructorIdInt);
    if (!isCourseAssignedToInstructorResult) {
      return res.status(400).json({ message: "You can't handle this course" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const assignments = await prisma.assignments.findMany({
      where: {
        course_id: courseIdInt,
        instructor_id: instructorIdInt,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        instructor: {
          select: {
            user_id: true,
            full_name: true,
          },
        },
        course: {
          select: {
            course_id: true,
            title: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      skip: skip,
      take: limit,
    });

    if (!assignments) {
      return res.status(400).json({ message: "Failed to get assignments" });
    }

    const totalAssignments = await prisma.assignments.count({
      where: {
        course_id: courseIdInt,
        instructor_id: instructorIdInt,
      },
    });

    const totalPages = Math.ceil(totalAssignments / limit);

    const total_submissions = await prisma.assignmentSubmission.count({
      where: {
        assignment_id: {
          in: assignments.map((a) => a.assignment_id),
        },
      },
    });

    const total_students = await prisma.enrollments.count({
      where: {
        course_id: courseIdInt,
      },
    });

    const formattedData = assignments.map((assignment) => ({
      ...assignment,
      start_date: new Date(assignment.start_date),
      end_date: new Date(assignment.end_date),
      assignmentSubmissions: assignment._count.submissions,
    }));

    return res.status(200).json({
      assignments: formattedData,
      total_submissions,
      total_students,
      pagination: {
        total: totalAssignments,
        limit: limit,
        currentPage: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLearnerAssignments = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        message: "Missing user id",
      });
    }
    const userIdInt = parseInt(userId);
    const enrolledCourses = await prisma.enrollments.findMany({
      where: {
        user_id: userIdInt,
      },
    });

    const userCourses = await prisma.courses.findMany({
      where: {
        course_id: {
          in: enrolledCourses.map((c) => c.course_id),
        },
      },
    });

    const assignments = await prisma.assignments.findMany({
      where: {
        course_id: {
          in: userCourses.map((c) => c.course_id),
        },
      },
      include: {
        course: {
          select: {
            course_id: true,
            title: true,
          },
        },
      },
    });

    if (!assignments) {
      return res.status(400).json({
        message: "Failed to get assignments",
      });
    }
    return res.status(200).json({
      data: assignments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignment_id, file_url, student_id } = req.body;
    if (!assignment_id || !file_url || !student_id) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const findAssignment = await prisma.assignments.findUnique({
      where: {
        assignment_id: Number(assignment_id),
      },
    });
    if (!findAssignment) {
      return res.status(400).json({
        error: "Assignment not found",
      });
    }
    const findStudent = await prisma.users.findUnique({
      where: {
        user_id: Number(student_id),
      },
    });
    if (!findStudent) {
      return res.status(400).json({
        error: "Student not found",
      });
    }
    const findSubmission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignment_id: Number(assignment_id),
        student_id: Number(student_id),
      },
    });
    if (findSubmission) {
      return res.status(400).json({
        error: "Assignment already submitted",
      });
    }
    if (Date.now() > new Date(findAssignment.end_date).getTime()) {
      return res.status(400).json({
        error: "Assignment submission deadline passed",
      });
    }
    const newSubmission = await prisma.assignmentSubmission.create({
      data: {
        assignment_id: Number(assignment_id),
        student_id: Number(student_id),
        file_url: file_url,
      },
    });
    if (!newSubmission) {
      return res.status(400).json({
        error: "Failed to submit assignment",
      });
    }
    return res.status(200).json({
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLearnersSubmitedAssignment = async (req, res) => {
  const { course_id, instructor_id, assignment_id } = req.query;
  if (!course_id || !instructor_id || !assignment_id) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  const courseIdInt = Number(course_id);
  const instructorIdInt = Number(instructor_id);
  const assignmentIdInt = Number(assignment_id);
  const isCourseAssignedToInstructorResult = await isCourseAssigndToInstructor(
    courseIdInt,
    instructorIdInt
  );
  if (!isCourseAssignedToInstructorResult) {
    return res.status(400).json({
      error: "You can't handle this course",
    });
  }
  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      assignment_id: assignmentIdInt,
    },
    select: {
      student: {
        select: {
          user_id: true,
          full_name: true,
        },
      },

      file_url: true,
      submission_id: true,
      submitted_at: true,
      assignment_id: true,
      grade: true,
      assignment: {
        select: {
          assignment_id: true,
          start_date: true,
          points: true,
          end_date: true,
          title: true,
        },
      },
    },
    orderBy: {
      submitted_at: "desc",
    },
  });

  if (!submissions) {
    return res.status(400).json({
      error: "Failed to get submissions",
    });
  }
  return res.status(200).json({
    submissions,
  });
};

export const submitReview = async (req, res) => {
  const { assignment_id, submission_id, grade, feedback, instructor_id } =
    req.body;
  if (!assignment_id || !submission_id || !grade || !instructor_id) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  const submission = await prisma.assignmentSubmission.findUnique({
    where: {
      submission_id: Number(submission_id),
    },
  });
  if (!submission) {
    return res.status(400).json({
      error: "Submission not found",
    });
  }
  const updatedSubmission = await prisma.assignmentSubmission.update({
    where: {
      submission_id: Number(submission_id),
    },
    data: {
      grade: Number(grade),
      feedback: feedback,
    },
  });
  if (!updatedSubmission) {
    return res.status(400).json({
      error: "Failed to submit review",
    });
  }
  return res.status(200).json({
    message: "Review submitted successfully",
  });
};

export const deleteAssignment = async (req, res) => {
  const { assignment_id } = req.params;
  const { course_id, instructor_id } = req.query;
  const courseIdInt = Number(course_id);
  const instructorIdInt = Number(instructor_id);
  if (!assignment_id || !course_id || !instructor_id) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  const isCourseAssignedToInstructorResult = await isCourseAssigndToInstructor(
    courseIdInt,
    instructorIdInt
  );
  if (!isCourseAssignedToInstructorResult) {
    return res.status(400).json({
      error: "You can't handle this course",
    });
  }
  const assignment = await prisma.assignments.findUnique({
    where: {
      assignment_id: Number(assignment_id),
    },
  });
  if (!assignment) {
    return res.status(400).json({
      error: "Assignment not found",
    });
  }
  const deletedAssignment = await prisma.assignments.delete({
    where: {
      assignment_id: Number(assignment_id),
    },
  });
  if (!deletedAssignment) {
    return res.status(400).json({
      error: "Failed to delete assignment",
    });
  }
  return res.status(200).json({
    message: "Assignment deleted successfully",
  });
};

export const updateAssignment = async (req, res) => {
  const { assignment_id } = req.params;
  const {
    title,
    description,
    start_date,
    end_date,
    points,
    instructor_id,
    course_id,
  } = req.body;
  const courseIdInt = Number(course_id);
  const instructorIdInt = Number(instructor_id);
  if (!assignment_id || !course_id || !instructor_id) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  const isCourseAssignedToInstructorResult = await isCourseAssigndToInstructor(
    courseIdInt,
    instructorIdInt
  );
  if (!isCourseAssignedToInstructorResult) {
    return res.status(400).json({
      error: "You can't handle this course",
    });
  }
  const assignment = await prisma.assignments.findUnique({
    where: {
      assignment_id: Number(assignment_id),
    },
  });
  if (!assignment) {
    return res.status(400).json({
      error: "Assignment not found",
    });
  }
  const updatedAssignment = await prisma.assignments.update({
    where: {
      assignment_id: Number(assignment_id),
    },
    data: {
      title: title,
      description: description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      points: Number(points),
    },
  });
  if (!updatedAssignment) {
    return res.status(400).json({
      error: "Failed to update assignment",
    });
  }
  return res.status(200).json({
    message: "Assignment updated successfully",
  });
};
