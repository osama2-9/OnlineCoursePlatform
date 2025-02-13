import { prisma } from "../prisma/prismaClint.js";
import { verifyAccessToken } from "../utils/verifyAccessToken.js";

export const getEnrolledInCourses = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    if (!userId) {
      return res.status(400).json({
        error: "user Id required",
      });
    }

    const courses = await prisma.enrollments.findMany({
      where: {
        user_id: userIdInt,
        access_granted: true,
      },

      include: {
        course: {
          include: {
            instructor: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getPaymentsHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "User Id requreid",
      });
    }

    const payments = await prisma.payments.findMany({
      where: {
        user_id: parseInt(userId),
      },
      include: {
        course: {
          select: {
            title: true,
            course_id: true,
          },
        },
      },
    });
    if (!payments) {
      return res.status(400).json({
        error: "error while try to retrive payments",
      });
    } else {
      return res.status(200).json(payments);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getEnrolledCourseContent = async (req, res) => {
  try {
    const { enrollmentId, courseId } = req.params;
    const userId = req.user.userId;

    const tokenVerification = await verifyAccessToken(
      userId,
      courseId,
      enrollmentId
    );

    if (!tokenVerification.isValid) {
      return res.status(403).json({ error: tokenVerification.message });
    }

    const lessons = await prisma.lessons.findMany({
      where: {
        course_id: parseInt(courseId),
      },
      select: {
        title: true,
        video_url: true,
        description: true,
        lesson_id: true,
        attachment: true,
        lesson_order: true,
      },
      orderBy: {
        lesson_order: "asc",
      },
    });

    if (!lessons) {
      return res.status(400).json({
        error: "Error while trying to get lessons",
      });
    }

    return res.status(200).json(lessons);
  } catch (error) {
    console.error("Error in getEnrolledCourseContent:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const markLessonsAsCompleted = async (req, res) => {
  try {
    const { lessonId, courseId, userId, completed } = req.body;

    if (!lessonId || !courseId || !userId || completed === undefined) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    const enrollment = await prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        error: "User is not enrolled in this course",
      });
    }

    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
      },
    });

    let progressRecord;

    if (existingProgress) {
      progressRecord = await prisma.userProgress.update({
        where: {
          progress_id: existingProgress.progress_id,
        },
        data: {
          is_completed: completed,
          last_accessed: new Date(),
        },
      });
    } else {
      progressRecord = await prisma.userProgress.create({
        data: {
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          is_completed: completed,
          last_accessed: new Date(),
        },
      });
    }

    const totalLessons = await prisma.lessons.count({
      where: {
        course_id: courseId,
      },
    });

    const completedLessons = await prisma.userProgress.count({
      where: {
        user_id: userId,
        course_id: courseId,
        is_completed: true,
      },
    });

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const overallProgressRecord = await prisma.userProgress.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
        lesson_id: null,
      },
    });

    if (!overallProgressRecord) {
      await prisma.userProgress.create({
        data: {
          user_id: userId,
          course_id: courseId,
          lesson_id: null,
          progress: progressPercentage,
          is_completed: progressPercentage === 100,
          last_accessed: new Date(),
        },
      });
    } else {
      await prisma.userProgress.update({
        where: {
          progress_id: overallProgressRecord.progress_id,
        },
        data: {
          progress: progressPercentage,
          is_completed: progressPercentage === 100,
          last_accessed: new Date(),
        },
      });
    }

    return res.status(200).json({
      message: "Lesson progress updated successfully",
      progress: progressRecord,
      overallProgress: progressPercentage,
    });
  } catch (error) {
    console.error("Error in markLessonsAsCompleted:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getCompletedLessons = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (!userId || !courseId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const progress = await prisma.userProgress.findMany({
      where: {
        user_id: parseInt(userId),
        course_id: parseInt(courseId),
      },
    });
    if (!progress) {
      return res.status(404).json({
        error: "No progress found",
      });
    }
    return res.status(200).json(progress);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getCoursesProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "Missing User Id",
      });
    }

    const getEnrolledCourses = await prisma.enrollments.findMany({
      where: {
        user_id: parseInt(userId),
      },
      include: {
        course: true,
      },
    });

    if (!getEnrolledCourses || getEnrolledCourses.length === 0) {
      return res.status(404).json({
        error: "You are not enrolled in any courses",
      });
    }

    const courseProgress = await Promise.all(
      getEnrolledCourses.map(async (enrollment) => {
        const courseId = enrollment.course_id;
        const enrollmentId = enrollment.enrollment_id;

        const totalLessons = await prisma.lessons.count({
          where: {
            course_id: courseId,
          },
        });

        const completedLessons = await prisma.userProgress.count({
          where: {
            user_id: parseInt(userId),
            course_id: courseId,
            is_completed: true,
          },
        });

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const lastAccessedProgress = await prisma.userProgress.findFirst({
          where: {
            user_id: parseInt(userId),
            course_id: courseId,
          },
          orderBy: {
            last_accessed: "desc",
          },
          include: {
            lesson: true,
          },
        });

        return {
          course_id: courseId,
          enrollmentId: enrollmentId,
          course_title: enrollment.course.title,
          course_thumbnail: enrollment.course.course_img,
          progress: progressPercentage,
          last_accessed: lastAccessedProgress?.last_accessed || null,
          current_lesson: lastAccessedProgress?.lesson?.title || null,
          is_completed: progressPercentage === 100,
        };
      })
    );

    return res.status(200).json(courseProgress);
  } catch (error) {
    console.error("Error in getCoursesProgress:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getAvliableQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: "Missing required params: userId",
      });
    }

    const enrollments = await prisma.enrollments.findMany({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        access_granted: true,
        course_id: true,
        enrollment_id: true,
      },
    });

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({
        error: "No enrollments found for this user",
      });
    }

    for (let i = 0; i < enrollments.length; i++) {
      const { course_id, enrollment_id } = enrollments[i];

      try {
        await verifyAccessToken(userId, course_id, enrollment_id);
      } catch (error) {
        console.error(
          `Access verification failed for enrollment ${enrollment_id}:`,
          error
        );
        continue;
      }
    }

    const courseIds = enrollments.map((enrollment) => enrollment.course_id);

    const quizzes = await prisma.quizzes.findMany({
      where: {
        course_id: {
          in: courseIds,
        },
        is_published: true,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        Attempt: {
          where: {
            user_id: parseInt(userId),
          },
          select: {
            score: true,
          },
        },
      },
    });

    const quizzesWithEnrollmentId = quizzes.map((quiz) => {
      const enrollment = enrollments.find(
        (enrollment) => enrollment.course_id === quiz.course_id
      );
      return {
        ...quiz,
        enrollment_id: enrollment ? enrollment.enrollment_id : null,
      };
    });

    return res.status(200).json({
      message: "Quizzes fetched successfully",
      quizzes: quizzesWithEnrollmentId,
    });
  } catch (error) {
    console.error("Error in getAvliableQuizzes:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const startQuizAttempt = async (req, res) => {
  try {
    const { userId, quizId, courseId, enrollmentId } = req.body;

    if (!userId || !quizId || !courseId || !enrollmentId) {
      return res.status(400).json({
        error: "Missing required data: userId, quizId, or courseId",
      });
    }

    const isUserEnrolled = await prisma.enrollments.findUnique({
      where: {
        enrollment_id: enrollmentId,
        user_id: userId,
        course_id: courseId,
      },
      select: {
        enrollment_id: true,
        course_id: true,
        user_id: true,
        access_granted: true,
      },
    });

    if (!isUserEnrolled) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    const verifyAccess = await verifyAccessToken(
      isUserEnrolled.user_id,
      isUserEnrolled.course_id,
      isUserEnrolled.enrollment_id
    );

    if (!verifyAccess) {
      return res.status(403).json({
        error: "Access denied. Invalid access token.",
      });
    }

    const maxAttempts = await prisma.quizzes.findUnique({
      where: {
        quiz_id: quizId,
      },
      select: {
        max_attempts: true,
      },
    });

    const userAttempts = await prisma.attempt.count({
      where: {
        user_id: userId,
        quiz_id: quizId,
      },
    });

    if (userAttempts >= maxAttempts?.max_attempts) {
      return res.status(400).json({
        error: "You have reached the maximum allowed attempts for this quiz.",
      });
    }

    const newAttempt = await prisma.attempt.create({
      data: {
        user_id: userId,
        quiz_id: quizId,
        start_time: new Date(),
        end_time: new Date(),
      },
    });

    if (!newAttempt) {
      return res.status(500).json({
        error: "Failed to start the quiz attempt. Please try again later.",
      });
    }

    return res.status(201).json({
      success: true,
      attempt: newAttempt,
    });
  } catch (error) {
    console.error("Error in startQuizAttempt:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};
export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId, courseId, userId, attemptId, enrollmentId } = req.params;

    if (!quizId || !courseId || !userId || !attemptId || !enrollmentId) {
      return res.status(400).json({
        error: "Missing required parameters.",
      });
    }

    const isUserEnrolled = await prisma.enrollments.findUnique({
      where: {
        enrollment_id: parseInt(enrollmentId),
        user_id: parseInt(userId),
        course_id: parseInt(courseId),
      },
    });
    if (!isUserEnrolled) {
      return res.status(403).json({
        error: "You are not enrolled in this course.",
      });
    }

    const verifyAccess = await verifyAccessToken(
      isUserEnrolled.user_id,
      isUserEnrolled.course_id,
      isUserEnrolled.enrollment_id
    );
    if (!verifyAccess) {
      return res.status(403).json({
        error: "Access denied. Invalid access token.",
      });
    }

    const isAttemptValid = await prisma.attempt.findUnique({
      where: {
        attempt_id: parseInt(attemptId),
        quiz_id: parseInt(quizId),
        user_id: parseInt(userId),
      },
    });
    if (!isAttemptValid) {
      return res.status(400).json({
        error: "Invalid attempt. Please start a new quiz attempt.",
      });
    }

    const quiz = await prisma.quizzes.findUnique({
      where: {
        quiz_id: parseInt(quizId),
      },
      include: {
        questions: {
          select: {
            question_id: true,
            question_text: true,
            question_type: true,
            marks: true,
            choices: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found.",
      });
    }

    const transformedQuiz = {
      ...quiz,
      questions: quiz.questions.map((question) => ({
        ...question,
        choices: question.choices
          ? question.choices.map((choice) => ({
              choice_id: choice.choice_id,
              choice_text: choice.choice_text,
            }))
          : [],
      })),
    };

    const totalQuestions = quiz.questions.length;
    const limit = 5;
    const totalPages = Math.ceil(totalQuestions / limit);

    return res.status(200).json({
      quiz: {
        ...transformedQuiz,
        pagination: {
          currentPage: 1,
          totalPages: totalPages,
          totalQuestions: totalQuestions,
          questionsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getQuizQuestions:", error);
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
};
export const submitQuizAnswers = async (req, res) => {
  try {
    const { attemptId, userAnswers, end_time } = req.body;

    if (!attemptId || !userAnswers || !end_time) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const attemptIdInt = parseInt(attemptId);

    const attempt = await prisma.attempt.findUnique({
      where: {
        attempt_id: attemptIdInt,
      },
      select: {
        user_id: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({
        error: "Attempt not found",
      });
    }

    if (attempt.user_id !== req.user.userId) {
      return res.status(403).json({
        error: "Unauthorized: You do not own this attempt",
      });
    }

    const createAnswerPromises = userAnswers.map((ua) => {
      return prisma.answer.create({
        data: {
          attempt_id: attemptIdInt,
          question_id: ua.question_id,
          answer_text: ua.answer_text || null,
          answer_id_choice: ua.answer_id || null,
        },
      });
    });

    await Promise.all(createAnswerPromises);

    await prisma.attempt.update({
      where: {
        attempt_id: attemptIdInt,
      },
      data: {
        end_time: new Date(end_time),
      },
    });

    return res.status(200).json({
      message: "Quiz answers submitted successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCourseReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId);
    if (!userIdInt) {
      return res.status(400).json({
        error: "User Id required",
      });
    }
    const usersEnrolledCourses = await prisma.enrollments.findMany({
      where: {
        user_id: userIdInt,
        access_granted: true,
        status: "completed",
      },
      select: {
        course_id: true,
      },
    });
    if (!usersEnrolledCourses) {
      return res.status(404).json({
        error: "No Courses Found",
      });
    }
    const courseIds = usersEnrolledCourses.map((enroll) => enroll.course_id);

    const courses = await prisma.courses.findMany({
      where: {
        course_id: { in: courseIds },
      },
      select: {
        course_id: true,
        title: true,
        course_img: true,
        category: true,
        instructor: {
          select: {
            full_name: true,
          },
        },
      },
    });

    const reviewedCourses = await prisma.reviews.findMany({
      where: {
        course_id: { in: courseIds },
        user_id: userIdInt,
      },
      select: {
        course_id: true,
      },
    });

    const reviewedCourseIds = reviewedCourses.map((review) => review.course_id);
    const coursesToReview = courses.filter(
      (course) => !reviewedCourseIds.includes(course.course_id)
    );

    if (!coursesToReview.length) {
      return res.status(400).json({
        error: "No courses available for review",
      });
    }
    return res.status(200).json(coursesToReview);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { userId, courseId, rating, comment } = req.body;
    if (!userId || !courseId || !rating || !comment) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const isUserEnrolled = await prisma.enrollments.findFirst({
      where: {
        user_id: userId,
        course_id: courseId,
      },
    });

    if (!isUserEnrolled) {
      return res.status(404).json({
        error: "You are not enrolled on this course",
      });
    }

    const newReview = await prisma.reviews.create({
      data: {
        user_id: userId,
        course_id: courseId,
        rating: rating,
        review_text: comment,
      },
    });
    if (!newReview) {
      return res.status(400).json({
        error: "Error while try to submit your review",
      });
    }
    return res.status(201).json({
      message: "Review Submited, Thank You !",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const cardsOverview = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const userIdInt = parseInt(userId);

    const enrollments = await prisma.enrollments.findMany({
      where: {
        user_id: userIdInt,
      },
      select: {
        status: true,
        course: {
          select: {
            course_id: true,
          },
        },
      },
    });

    const courses = enrollments.map(
      (enrollment) => enrollment.course.course_id
    );

    const quizzes = await prisma.quizzes.findMany({
      where: {
        course_id: { in: courses },
      },
      select: {
        Attempt: {
          select: {
            score: true,
          },
        },
      },
    });

    let totalScore = 0;
    let totalQuizzes = quizzes.length;
    let completed = 0;
    let inProgress = 0;

    enrollments.map((enrollment) => {
      if (enrollment.status === "completed") {
        completed++;
      }
      if (enrollment.status === "active") {
        inProgress++;
      }
    });
    console.log(totalQuizzes);

    quizzes.map((quiz) => {
      quiz.Attempt.map((attempt) => {
        console.log(attempt);

        totalScore += attempt.score;
      });
    });

    const avgScore = totalScore / totalQuizzes;

    return res.status(200).json({
      averageScore: avgScore,
      completed: completed,
      inProgress: inProgress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
