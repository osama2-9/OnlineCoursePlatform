import { genreateQuestionAttempt } from "../openAI/openAi.js";
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

export const getInstructorCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!instructorId) {
      return res.status(400).json({ error: "Missing instructorId" });
    }

    const parsedInstructorId = parseInt(instructorId);
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedInstructorId)) {
      return res.status(400).json({ error: "Invalid instructorId" });
    }

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ error: "Invalid limit" });
    }

    const totalCourses = await prisma.courses.count({
      where: { instructor_id: parsedInstructorId },
    });

    const totalPages = Math.ceil(totalCourses / parsedLimit);
    const skip = (parsedPage - 1) * parsedLimit;

    const courses = await prisma.courses.findMany({
      where: { instructor_id: parsedInstructorId },
      select: {
        course_id: true,
        title: true,
        description: true,
        category: true,
        course_img: true,
        is_published: true,
        course_type: true,
        created_at: true,
        learning_outcomes: true,
        price: true,
      },
      skip: skip,
      take: parsedLimit,
    });

    const courseIds = courses.map((course) => course.course_id);

    const enrollmentsPromise = prisma.enrollments.groupBy({
      by: ["course_id"],
      _count: { course_id: true },
      where: { course_id: { in: courseIds } },
    });

    const ratingsPromise = prisma.reviews.groupBy({
      by: ["course_id"],
      _avg: { rating: true },
      where: { course_id: { in: courseIds } },
    });

    const [enrollments, ratings] = await Promise.all([
      enrollmentsPromise,
      ratingsPromise,
    ]);

    const coursesWithDetails = courses.map((course) => {
      const enrollment = enrollments.find(
        (e) => e.course_id === course.course_id
      );
      const rating = ratings.find((r) => r.course_id === course.course_id);

      return {
        ...course,
        total_enrollments: enrollment?._count?.course_id || 0,
        average_rating: rating?._avg?.rating || 0,
      };
    });

    return res.status(200).json({
      courses: coursesWithDetails,
      pagination: {
        totalCourses,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getEnrollmentData = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate instructorId
    if (!instructorId) {
      return res.status(400).json({ error: "Missing instructor id" });
    }

    const parsedInstructorId = parseInt(instructorId);
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    if (isNaN(parsedInstructorId)) {
      return res.status(400).json({ error: "Invalid instructorId" });
    }

    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ error: "Invalid limit" });
    }

    const totalEnrollments = await prisma.enrollments.count({
      where: {
        course: {
          instructor_id: parsedInstructorId,
        },
      },
    });

    const totalPages = Math.ceil(totalEnrollments / parsedLimit);
    const skip = (parsedPage - 1) * parsedLimit;

    const enrollments = await prisma.enrollments.findMany({
      where: {
        course: {
          instructor_id: parsedInstructorId,
        },
      },
      select: {
        enrollment_id: true,
        enrollment_date: true,
        status: true,
        user: {
          select: {
            full_name: true,
            is_active: true,
            isEmailVerified: true,
            email: true,
            lastLogin: true,
          },
        },
        course: {
          select: {
            title: true,
            course_id: true,
          },
        },
      },
      skip: skip,
      take: parsedLimit,
    });

    return res.status(200).json({
      enrollments,
      pagination: {
        totalEnrollments,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching enrollment data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateMyCourse = async (req, res) => {
  try {
    const { instructorId, courseId, title, description, learning_outcomes } =
      req.body;
    if (
      !instructorId ||
      !courseId ||
      !title ||
      !description ||
      !learning_outcomes
    ) {
      return res.status(400).json({
        error: "Please fill all inputs !",
      });
    }
    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    const update = await prisma.courses.update({
      where: {
        course_id: parseInt(courseId),
      },
      data: {
        title: title,
        description: description,
        learning_outcomes: learning_outcomes,
      },
    });
    if (!update) {
      return res.status(400).json({
        error: "Error while try to update the course",
      });
    } else {
      return res.status(200).json({
        message: "Course updated !",
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
export const getAnalysticsForCharts = async (req, res) => {
  try {
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({
        error: "Instructor Id Required",
      });
    }

    const instructorCourses = await prisma.courses.findMany({
      where: {
        instructor_id: parseInt(instructorId),
      },
      select: {
        course_id: true,
        title: true,
      },
    });

    if (instructorCourses.length === 0) {
      return res.status(400).json({
        error: "No courses found for this instructor",
      });
    }

    const instructorCourseIds = instructorCourses.map(
      (course) => course.course_id
    );

    const quizzes = await prisma.quizzes.findMany({
      where: {
        course_id: { in: instructorCourseIds },
      },
      select: {
        course_id: true,
        Attempt: {
          select: {
            score: true,
          },
        },
      },
    });

    const coursesProgress = await prisma.userProgress.findMany({
      where: {
        course_id: { in: instructorCourseIds },
      },
      select: {
        progress: true,
        course_id: true,
      },
    });

    const filteredProgress = coursesProgress.filter((cp) => cp.progress > 0);

    if (filteredProgress.length === 0) {
      return res.status(400).json({
        error: "No progress found (excluding 0% progress)",
      });
    }

    const courseAnalyticsMap = {};

    instructorCourses.forEach((course) => {
      courseAnalyticsMap[course.course_id] = {
        title: course.title,
        totalScore: 0,
        totalMaxScore: 0,
        totalProgress: 0,
        progressCount: 0,
      };
    });

    quizzes.forEach((quiz) => {
      const courseId = quiz.course_id;
      const scores = quiz.Attempt.map((attempt) => attempt.score);
      const maxScore = Math.max(...scores, 10);
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      const totalMaxScore = maxScore * quiz.Attempt.length;

      if (courseAnalyticsMap[courseId]) {
        courseAnalyticsMap[courseId].totalScore += totalScore;
        courseAnalyticsMap[courseId].totalMaxScore += totalMaxScore;
      }
    });

    filteredProgress.forEach((cp) => {
      const courseId = cp.course_id;
      if (courseAnalyticsMap[courseId]) {
        courseAnalyticsMap[courseId].totalProgress += cp.progress;
        courseAnalyticsMap[courseId].progressCount += 1;
      }
    });

    const courseAnalytics = Object.keys(courseAnalyticsMap).map((courseId) => {
      const courseData = courseAnalyticsMap[courseId];
      const totalScorePercentage =
        courseData.totalMaxScore > 0
          ? (courseData.totalScore / courseData.totalMaxScore) * 100
          : 0;
      const avgProgress =
        courseData.progressCount > 0
          ? courseData.totalProgress / courseData.progressCount
          : 0;

      return {
        course_id: parseInt(courseId),
        title: courseData.title,
        avgProgress: avgProgress.toFixed(2),
        totalScorePercentage: totalScorePercentage.toFixed(2),
      };
    });

    return res.status(200).json({
      courseAnalytics,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getStudentProgress = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 5, courseTitle } = req.query;
    const instructorIdInt = parseInt(instructorId);
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (!instructorId) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    const courses = await prisma.courses.findMany({
      where: {
        instructor_id: instructorIdInt,
        title: courseTitle
          ? { contains: courseTitle, mode: "insensitive" }
          : undefined,
      },
      select: {
        title: true,
        course_id: true,
      },
    });

    const coursesIds = courses.map((course) => course.course_id);

    const enrollments = await prisma.enrollments.findMany({
      where: {
        course_id: { in: coursesIds },
      },
      select: {
        user_id: true,
        course_id: true,
      },
    });

    const usersIds = enrollments.map((enrollment) => enrollment.user_id);

    const totalUsers = await prisma.users.count({
      where: {
        user_id: { in: usersIds },
      },
    });

    const users = await prisma.users.findMany({
      where: {
        user_id: { in: usersIds },
      },
      select: {
        user_id: true,
        full_name: true,
        userProgress: {
          select: {
            progress: true,
            course_id: true,
          },
        },
        attempts: {
          select: {
            score: true,
            quiz: {
              select: {
                course_id: true,
              },
            },
          },
        },
        enrollments: {
          select: {
            course: {
              select: {
                title: true,
                course_id: true,
              },
            },
          },
        },
      },
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
    });

    const courseWiseData = courses.map((course) => {
      const usersInCourse = users.filter((user) =>
        user.enrollments.some(
          (enrollment) => enrollment.course.course_id === course.course_id
        )
      );

      const studentProgress = usersInCourse.map((user) => {
        const userProgressInCourse = user.userProgress.filter(
          (progress) => progress.course_id === course.course_id
        );
        const totalProgress = userProgressInCourse.reduce(
          (sum, progress) => sum + progress.progress,
          0
        );
        const averageProgress =
          userProgressInCourse.length > 0
            ? (totalProgress / userProgressInCourse.length).toFixed(2)
            : "0.00";

        const userAttemptsInCourse = user.attempts.filter(
          (attempt) => attempt.quiz.course_id === course.course_id
        );
        const totalQuizScore = userAttemptsInCourse.reduce(
          (sum, attempt) => sum + attempt.score,
          0
        );
        const averageQuizScore =
          userAttemptsInCourse.length > 0
            ? (totalQuizScore / userAttemptsInCourse.length).toFixed(2)
            : "0.00";

        return {
          user_id: user.user_id,
          full_name: user.full_name,
          progress: averageProgress,
          quiz_score: averageQuizScore,
        };
      });

      return {
        course_id: course.course_id,
        course_title: course.title,
        students: studentProgress,
      };
    });

    const totalPages = Math.ceil(totalUsers / limitNumber);

    return res.status(200).json({
      data: courseWiseData,
      pagination: {
        currentPage: pageNumber,
        totalPages: totalPages,
        totalItems: totalUsers,
        itemsPerPage: limitNumber,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const createQuiz = async (req, res) => {
  try {
    const {
      instructorId,
      courseId,
      title,
      description,
      duration,
      maxAttempts,
    } = req.body;
    if (
      !instructorId ||
      !courseId ||
      !title ||
      !description ||
      !duration ||
      !maxAttempts
    ) {
      return res.status(400).json({
        error: "Please fill all inputs",
      });
    }

    const isCourseAssigndToInstructor = await prisma.courses.findUnique({
      where: {
        instructor_id: instructorId,
        course_id: courseId,
      },
    });
    if (!isCourseAssigndToInstructor) {
      return res.status(400).json({
        error: "You can't handle this course",
      });
    }
    const newQuiz = await prisma.quizzes.create({
      data: {
        course_id: courseId,
        title: title,
        description: description,
        duration: duration,
        max_attempts: maxAttempts,
      },
    });
    if (!newQuiz) {
      return res.status(400).json({
        error: "Feild to create this quiz",
      });
    }
    return res.status(201).json({
      message: "Quiz created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const createQuestion = async (req, res) => {
  try {
    console.log(req.body);

    const {
      courseId,
      instructorId,
      quizId,
      question_text,
      question_type,
      mark,
      choices,
      correct_answer,
    } = req.body;

    if (!quizId || !question_text || !question_type || !mark) {
      return res.status(400).json({
        error: "Please fill all inputs",
      });
    }

    await isHavePermession(courseId, instructorId);

    // Validate correct_answer for MCQ and True/False questions
    if (question_type === "mcq" || question_type === "truefalse") {
      if (correct_answer === undefined || correct_answer === null) {
        return res.status(400).json({
          error: "Please select the correct answer.",
        });
      }

      if (question_type === "mcq" && correct_answer >= choices.length) {
        return res.status(400).json({
          error: "Invalid correct_answer.",
        });
      }
    }

    // Create the question
    const createQuestion = await prisma.question.create({
      data: {
        quiz_id: parseInt(quizId),
        question_text: question_text,
        question_type: question_type,
        marks: mark,
      },
    });

    if (!createQuestion) {
      return res.status(400).json({
        error: "Error while trying to add question",
      });
    }

    // Handle MCQ and True/False questions
    if (question_type === "mcq" || question_type === "truefalse") {
      // Create choices
      for (const choice of choices) {
        await prisma.choice.create({
          data: {
            question_id: createQuestion.question_id,
            choice_text: choice,
            is_correct: choice === choices[correct_answer],
          },
        });
      }
    }

    return res.status(201).json({
      message: "Question Created and Choices Added",
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

export const getQuizzes = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const skip = (page - 1) * pageSize;

    if (!instructorId) {
      return res.status(400).json({
        error: "Missing required params: instructorId",
      });
    }

    const courses = await prisma.courses.findMany({
      where: {
        instructor_id: parseInt(instructorId),
      },
      select: {
        course_id: true,
        title: true,
      },
    });

    if (courses.length === 0) {
      return res.status(200).json({
        quizzes: [],
        totalQuizzes: 0,
        totalPages: 0,
        currentPage: page,
      });
    }

    const courseIds = courses.map((course) => course.course_id);

    const quizzes = await prisma.quizzes.findMany({
      where: {
        course_id: { in: courseIds },
      },
      select: {
        quiz_id: true,
        title: true,
        description: true,
        duration: true,
        max_attempts: true,
        created_at: true,
        is_published: true,

        course: {
          select: {
            title: true,
            course_id: true,
          },
        },
      },
      skip: skip,
      take: pageSize,
    });

    const totalQuizzes = await prisma.quizzes.count({
      where: {
        course_id: { in: courseIds },
      },
    });

    const totalPages = Math.ceil(totalQuizzes / pageSize);

    return res.status(200).json({
      quizzes,
      totalQuizzes,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const reviewQuiz = async (req, res) => {
  try {
    const { instructorId, courseId, quizId } = req.params;

    if (!instructorId || !courseId || !quizId) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    const quizDetails = await prisma.quizzes.findUnique({
      where: {
        quiz_id: parseInt(quizId),
      },
      select: {
        quiz_id: true,
        title: true,
        description: true,
        is_published: true,
        max_attempts: true,
        duration: true,
        course_id: true,
      },
    });

    if (!quizDetails) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    // Fetch questions and their choices
    const questions = await prisma.question.findMany({
      where: {
        quiz_id: parseInt(quizId),
      },
      include: {
        choices: true, // Include choices for each question
      },
      orderBy: {
        question_id: "asc",
      },
    });

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        error: "No questions found for this quiz",
      });
    }

    // Format the response
    const formattedQuestions = questions.map((question) => {
      return {
        question_id: question.question_id,
        quiz_id: question.quiz_id,
        question_text: question.question_text,
        question_type: question.question_type,
        marks: question.marks,
        choices: question.choices.map((choice) => ({
          choice_id: choice.choice_id,
          choice_text: choice.choice_text,
          is_correct: choice.is_correct,
        })),
      };
    });

    return res.status(200).json({
      quiz: quizDetails,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId, instructorId, quizId, courseId } = req.params;

    if (!questionId || !instructorId || !quizId || !courseId) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    const findQuiz = await prisma.quizzes.findUnique({
      where: {
        quiz_id: parseInt(quizId),
      },
    });

    if (!findQuiz) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    await prisma.choice.deleteMany({
      where: {
        question_id: parseInt(questionId),
      },
    });

    const question = await prisma.question.delete({
      where: {
        question_id: parseInt(questionId),
      },
    });

    if (!question) {
      return res.status(400).json({
        error: "Error while trying to delete the question",
      });
    }

    return res.status(200).json({
      message: "Question and associated answers deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    console.log(req.body);

    const {
      questionId,
      instructorId,
      courseId,
      question_type,
      question_text,
      answers,
      mark,
      correct_answer,
    } = req.body;

    if (
      !questionId ||
      !instructorId ||
      !courseId ||
      !question_type ||
      !question_text ||
      !mark
    ) {
      return res.status(400).json({
        error: "Please fill all required inputs",
      });
    }

    if (question_type === "mcq" || question_type === "truefalse") {
      if (!answers || answers.length === 0) {
        return res.status(400).json({
          error: "Please provide answers for MCQ or True/False questions",
        });
      }

      if (correct_answer === null || correct_answer === undefined) {
        return res.status(400).json({
          error:
            "Please select the correct answer for MCQ or True/False questions",
        });
      }
    }

    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    let choices = null;
    if (question_type === "mcq" || question_type === "truefalse") {
      choices = {
        options: answers,
        correctIndex: correct_answer,
      };
    }

    const updatedQuestion = await prisma.question.update({
      where: {
        question_id: parseInt(questionId),
      },
      data: {
        question_text: question_text,
        question_type: question_type,
        marks: parseFloat(mark),
        choices: choices,
      },
    });

    if (!updatedQuestion) {
      return res.status(400).json({
        error: "Failed to update the question",
      });
    }

    if (question_type === "mcq" || question_type === "truefalse") {
      await prisma.answer.deleteMany({
        where: {
          question_id: parseInt(questionId),
        },
      });

      const answerPromises = answers.map((answer, index) => {
        return prisma.answer.create({
          data: {
            question_id: parseInt(questionId),
            answer_text: answer,
            is_correct: index === correct_answer,
          },
        });
      });

      await Promise.all(answerPromises);
    }

    return res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const toggleQuizPublish = async (req, res) => {
  try {
    const { is_published, quizId } = req.body;

    const quiz = await prisma.quizzes.findUnique({
      where: {
        quiz_id: parseInt(quizId),
      },
    });

    if (!quiz) {
      return res.status(400).json({
        error: "Quiz not found",
      });
    }

    const isHaveQuestions = await prisma.question.count({
      where: {
        quiz_id: parseInt(quizId),
      },
    });

    if (isHaveQuestions === 0) {
      return res.status(400).json({
        error: "Cannot publish a quiz without questions",
      });
    }

    const updatedQuiz = await prisma.quizzes.update({
      where: {
        quiz_id: parseInt(quizId),
      },
      data: {
        is_published: is_published,
      },
    });

    return res.status(200).json({
      message: `Quiz ${
        is_published ? "published" : "unpublished"
      } successfully!`,
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getUsersAttempts = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!instructorId) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    const courses = await prisma.courses.findMany({
      where: {
        instructor_id: parseInt(instructorId),
      },
      select: {
        course_id: true,
        title: true,
      },
    });

    const coursesIds = courses.map((course) => course.course_id);

    if (coursesIds.length > 0) {
      const offset = (page - 1) * limit;

      const quizzes = await prisma.quizzes.findMany({
        where: {
          course_id: { in: coursesIds },
        },
        select: {
          quiz_id: true,
          course_id: true,
          title: true,
          duration: true,
          Attempt: {
            select: {
              user: {
                select: {
                  full_name: true,
                  user_id: true,
                },
              },
              score: true,
              attempt_id: true,
              start_time: true,
              end_time: true,
            },
          },
        },
        skip: offset,
        take: parseInt(limit),
      });

      const totalQuizzes = await prisma.quizzes.count({
        where: {
          course_id: { in: coursesIds },
        },
      });

      if (quizzes) {
        return res.status(200).json({
          data: quizzes,
          pagination: {
            total: totalQuizzes,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalQuizzes / limit),
          },
        });
      }
    } else {
      return res.status(404).json({
        message: "No courses found for this instructor",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getUserAnswers = async (req, res) => {
  try {
    const { page = 1, skip, take } = req.query;
    const { instructorId, quizId, attemptId, courseId } = req.params;

    if (!instructorId || !quizId || !attemptId || !courseId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    const pageNumber = parseInt(page);
    const itemsPerPage = parseInt(take) || 5;
    const skipCount = parseInt(skip) || (pageNumber - 1) * itemsPerPage;

    const quiz = await prisma.quizzes.findUnique({
      where: {
        quiz_id: parseInt(quizId),
      },
      select: {
        quiz_id: true,
        title: true,
        questions: {
          select: {
            question_id: true,
            question_text: true,
            question_type: true,
            marks: true,
            choices: true,
          },
          skip: skipCount,
          take: itemsPerPage,
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    // Fetch answers for the attempt
    const answers = await prisma.answer.findMany({
      where: {
        attempt_id: parseInt(attemptId),
      },
      skip: skipCount,
      take: itemsPerPage,
    });

    // Combine questions and answers into a single response object
    const questionsWithAnswers = quiz.questions.map((question) => {
      const answer = answers.find(
        (ans) => ans.question_id === question.question_id
      );

      return {
        question_id: question.question_id,
        question_text: question.question_text,
        question_type: question.question_type,
        marks: question.marks,
        choices: question.choices,
        answer_id: answer ? answer.answer_id : null,
        answer_text: answer ? answer.answer_text : null,
      };
    });

    const totalQuestions = await prisma.question.count({
      where: {
        quiz_id: parseInt(quizId),
      },
    });

    const totalAnswers = await prisma.answer.count({
      where: {
        attempt_id: parseInt(attemptId),
      },
    });

    const response = {
      data: {
        quiz: {
          quiz_id: quiz.quiz_id,
          title: quiz.title,
          questions: questionsWithAnswers, // Use the combined object
        },
      },
      pagination: {
        currentPage: pageNumber,
        itemsPerPage,
        totalQuestions,
        totalAnswers,
        totalPages: Math.ceil(totalQuestions / itemsPerPage),
      },
    };

    return res.status(200).json(response);
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
export const updateAttemptScore = async (req, res) => {
  try {
    const { attemptId, scores } = req.body;

    if (!attemptId || !scores) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const totalScore = Object.values(scores).reduce(
      (sum, mark) => sum + mark,
      0
    );

    const attempt = await prisma.attempt.update({
      where: {
        attempt_id: parseInt(attemptId),
      },
      data: {
        score: totalScore,
      },
    });

    if (!attempt) {
      return res.status(400).json({
        error: "Error while updating the score",
      });
    }

    return res.status(201).json({
      message: "Score Updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLessonsByCourseId = async (req, res) => {
  try {
    const { instructorId, courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!instructorId || !courseId) {
      return res.status(400).json({
        error: "Missing required params",
      });
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    await isHavePermession(parseInt(courseId), parseInt(instructorId));

    const totalLessons = await prisma.lessons.count({
      where: {
        course_id: parseInt(courseId),
      },
    });

    const lessons = await prisma.lessons.findMany({
      where: {
        course_id: parseInt(courseId),
      },
      select: {
        lesson_id: true,
        title: true,
        description: true,
        is_free: true,
        lesson_order: true,
        video_url: true,
        attachment: true,
      },
      skip,
      take: parsedLimit,
      orderBy: {
        lesson_order: "asc",
      },
    });

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({
        error: "No lessons found",
      });
    }

    const totalPages = Math.ceil(totalLessons / parsedLimit);

    return res.status(200).json({
      lessons,
      pagination: {
        currentPage: parsedPage,
        totalPages,
        totalLessons,
        lessonsPerPage: parsedLimit,
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

export const aiSuggestionsQuestion = async (req, res) => {
  try {
    const { questionType, quizname, course } = req.body;
    if (!questionType || !quizname || !course) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const response = await genreateQuestionAttempt(
      questionType,
      quizname,
      course
    );

    if (response) {
      return res.status(200).json(response);
    } else {
      return res.status(400).json({
        error: "Error while try to get suggestion",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
