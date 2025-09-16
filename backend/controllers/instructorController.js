import sendMail from "../emails/sendMail.js";
import { genreateQuestionAttempt } from "../openAI/openAi.js";
import { prisma } from "../prisma/prismaClint.js";
import { newQuizNotification } from "../services/notifications.js";
import { v2 as cloudinary } from "cloudinary";
import { getCache, setCache } from "../services/redis/cache.js";
const isHavePermession = async (course_id, instructor_id) => {
  try {
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
        user_id: instructorId,
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
  } catch (error) {
    console.error("Error in isHavePermission:", error);
    throw error;
  }
};
export const getInstructorCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!instructorId) {
      return res.status(400).json({ error: "Missing instructorId" });
    }
    const cacheKey = `instructorDashboard:courses:${instructorId}:${page}:${limit}`;
    const paginationCacheKey = `instructorDashboard:pagination:${instructorId}:${page}:${limit}`;

    const cachedCoursesData = await getCache(cacheKey);
    const cachedPaginationData = await getCache(paginationCacheKey);
    if (cachedCoursesData && cachedPaginationData) {
      return res.status(200).json({
        courses: cachedCoursesData,
        pagination: cachedPaginationData,
        cached: true,
      });
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

    const paginationData = {
      totalCourses,
      totalPages,
      currentPage: parsedPage,
      limit: parsedLimit,
    };

    const cacheExpiration = 60 * 50;
    await setCache(cacheKey, coursesWithDetails, cacheExpiration);
    await setCache(paginationCacheKey, paginationData, cacheExpiration);

    return res.status(200).json({
      courses: coursesWithDetails,
      pagination: paginationData,
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

    const cacheKey = `InstructorDashboardEnrollmentData${instructorId}:${page}:${limit}`;
    const paginationCacheKey = `InstructorDashboardEnrollmentData:pagination:${instructorId}:${page}:${limit}`;

    const cachedEnrollmentData = await getCache(cacheKey);
    const cachedPagination = await getCache(paginationCacheKey);

    if (cachedEnrollmentData && cachedPagination) {
      return res.status(200).json({
        enrollments: cachedEnrollmentData,
        pagination: paginationCacheKey,
      });
    }

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
        is_eligible_for_certificate: true,
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

    const paginationData = {
      totalEnrollments,
      totalPages,
      currentPage: parsedPage,
      limit: parsedLimit,
    };

    const cacheExpiration = 50 * 60;
    await setCache(cacheKey, enrollments, cacheExpiration);
    await setCache(paginationCacheKey, paginationData, cacheExpiration);

    return res.status(200).json({
      enrollments: enrollments,
      pagination: paginationData,
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
    const instructorId = req.user.userId;
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
        enrollment_date: true,
        status: true,
        total_score: true,
        is_eligible_for_certificate: true,
        access_granted: true,
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
        email: true,
        is_active: true,
        isEmailVerified: true,
        lastLogin: true,
        enrollments: {
          where: {
            course_id: { in: coursesIds },
          },
          select: {
            course_id: true,
            enrollment_date: true,
            status: true,
            total_score: true,
            is_eligible_for_certificate: true,
            access_granted: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        userProgress: {
          where: {
            course_id: { in: coursesIds },
          },
          select: {
            course_id: true,
            progress: true,
            is_completed: true,
            last_accessed: true,
          },
        },
        attempts: {
          where: {
            quiz: {
              course_id: { in: coursesIds },
            },
          },
          select: {
            attempt_id: true,
            quiz_id: true,
            score: true,
            start_time: true,
            end_time: true,
            quiz: {
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
          (enrollment) => enrollment.course_id === course.course_id
        )
      );

      const students = usersInCourse.map((user) => {
        const enrollment = user.enrollments.find(
          (en) => en.course_id === course.course_id
        );

        const progressArr = user.userProgress.filter(
          (prog) => prog.course_id === course.course_id
        );
        const totalProgress = progressArr.reduce(
          (sum, prog) => sum + prog.progress,
          0
        );
        const avgProgress =
          progressArr.length > 0
            ? (totalProgress / progressArr.length).toFixed(2)
            : "0.00";

        const attempts = user.attempts
          .filter((att) => att.quiz.course_id === course.course_id)
          .map((att) => ({
            attempt_id: att.attempt_id,
            quiz_id: att.quiz_id,
            quiz_title: att.quiz.title,
            score: att.score,
            start_time: att.start_time,
            end_time: att.end_time,
          }));

        const totalQuizScore = attempts.reduce(
          (sum, att) => sum + att.score,
          0
        );
        const avgQuizScore =
          attempts.length > 0
            ? (totalQuizScore / attempts.length).toFixed(2)
            : "0.00";

        return {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          is_active: user.is_active,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          enrollment: {
            enrollment_date: enrollment?.enrollment_date,
            status: enrollment?.status,
            total_score: enrollment?.total_score,
            is_eligible_for_certificate:
              enrollment?.is_eligible_for_certificate,
            access_granted: enrollment?.access_granted,
            course_title: enrollment?.course?.title,
          },
          progress: avgProgress,
          progress_details: progressArr,
          avg_quiz_score: avgQuizScore,
          quiz_attempts: attempts,
        };
      });

      return {
        course_id: course.course_id,
        course_title: course.title,
        students,
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
    const metaKey = `quiz:${newQuiz.quiz_id}:meta`;
    let cachedMeta = await getCache(metaKey);
    if (!cachedMeta) {
      const dataFormated = {
        quiz_id: newQuiz.quiz_id,
        total_marks: newQuiz.total_marks,
        title: title,
        is_published: false,
        description: description,
        duration: duration,
        max_attempts: maxAttempts,
      };
      await setCache(metaKey, dataFormated);
    }

    try {
      await newQuizNotification(courseId);
    } catch (notificationError) {
      console.error("Failed to send quiz notification:", notificationError);
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
      return res.status(400).json({ error: "Please fill all inputs" });
    }

    await isHavePermession(courseId, instructorId);

    if (["mcq", "truefalse"].includes(question_type)) {
      if (correct_answer === undefined || correct_answer === null) {
        return res
          .status(400)
          .json({ error: "Please select the correct answer." });
      }
      if (question_type === "mcq" && correct_answer >= choices.length) {
        return res.status(400).json({ error: "Invalid correct_answer." });
      }
    }

    const newQuestion = await prisma.question.create({
      data: {
        quiz_id: parseInt(quizId),
        question_text,
        question_type,
        marks: parseFloat(mark),
      },
    });

    let choicesData = [];
    if (["mcq", "truefalse"].includes(question_type)) {
      for (let i = 0; i < choices.length; i++) {
        const createdChoice = await prisma.choice.create({
          data: {
            question_id: newQuestion.question_id,
            choice_text: choices[i],
            is_correct: i === correct_answer,
          },
        });
        choicesData.push(createdChoice);
      }
    }

    const questionWithChoices = {
      ...newQuestion,
      choices: choicesData,
    };

    let pageNumber = 1;
    let pageKey = `quiz:${quizId}:page:${pageNumber}`;
    let cachedPage = await getCache(pageKey);

    while (cachedPage && cachedPage.length >= 5) {
      pageNumber++;
      pageKey = `quiz:${quizId}:page:${pageNumber}`;
      cachedPage = await getCache(pageKey);
    }

    if (cachedPage) {
      cachedPage.push(questionWithChoices);
    } else {
      cachedPage = [questionWithChoices];
    }

    await setCache(pageKey, cachedPage);

    return res.status(201).json({
      message: "Question Created and Cached",
      pageNumber,
      question: questionWithChoices,
    });
  } catch (error) {
    console.error("Error in createQuestion:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId, courseId } = req.params;

    const userId = req.user.userId;

    await isHavePermession(courseId, userId);

    if (!quizId) {
      return res.status(400).json({
        error: "Missing required params: quizId",
      });
    }

    const quizIdInt = parseInt(quizId);

    const deleteAnswers = await prisma.answer.deleteMany({
      where: {
        question: {
          quiz_id: quizIdInt,
        },
      },
    });
    const deletequizAttempts = await prisma.attempt.deleteMany({
      where: {
        quiz_id: quizIdInt,
      },
    });

    const deletequizChoices = await prisma.choice.deleteMany({
      where: {
        question: {
          quiz_id: quizIdInt,
        },
      },
    });
    const deletequizQuestions = await prisma.question.deleteMany({
      where: {
        quiz_id: quizIdInt,
      },
    });
    const deletequiz = await prisma.quizzes.delete({
      where: {
        quiz_id: quizIdInt,
      },
    });

    if (
      !deletequizAttempts ||
      !deletequizChoices ||
      !deletequizQuestions ||
      !deletequiz ||
      !deleteAnswers
    ) {
      return res.status(400).json({
        error: "Error while try to delete quiz",
      });
    }

    return res.status(200).json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 8;
    const skip = (page - 1) * pageSize;


    const cacheKey =`instructorDashboardQuizzess:${instructorId}:${page}:${pageSize}`

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

    const questions = await prisma.question.findMany({
      where: {
        quiz_id: parseInt(quizId),
      },
      include: {
        choices: true,
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

    const existingChoices = await prisma.choice.findMany({
      where: { question_id: parseInt(questionId) },
    });
    console.log(existingChoices);
    const choicesData = answers.map((answer, index) => ({
      choice_id: existingChoices[index]?.choice_id || undefined,
      choice_text: answer,
      question_id: parseInt(questionId),
      is_correct: index === parseInt(correct_answer),
    }));

    const updatedQuestion = await prisma.question.update({
      where: { question_id: parseInt(questionId) },
      data: {
        question_text,
        question_type,
        marks: parseFloat(mark),
        choices: {
          upsert: choicesData.map((choice) => ({
            where: { choice_id: choice.choice_id || 0 },
            update: {
              choice_text: choice.choice_text,
              is_correct: choice.is_correct,
            },
            create: {
              choice_text: choice.choice_text,
              is_correct: choice.is_correct,
            },
          })),
        },
      },
      include: { choices: true },
    });

    if (!updatedQuestion) {
      return res.status(400).json({
        error: "Failed to update the question",
      });
    }

    return res.status(200).json({
      message: "Question updated successfully",
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
          total_marks: true,
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
            choices: {
              where: {
                is_correct: true,
              },
              select: {
                is_correct: true,
                choice_text: true,
                question_id: true,
                choice_id: true,
              },
            },
          },
          skip: skipCount,
          take: itemsPerPage,
        },
        Attempt: {
          where: { attempt_id: parseInt(attemptId) },
          select: {
            start_time: true,
            end_time: true,
            attempt_id: true,
            score: true,
            quiz_id: true,
            answers: {
              select: {
                answer_id: true,
                answer_text: true,
                answer_id_choice: true,
                question_id: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

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
          questions: quiz.questions,
          attempt: quiz.Attempt,
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

export const updateQuizInformations = async (req, res) => {
  try {
    const { quizId, title, description, max_attempts, duration } = req.body;

    if (!quizId || !title || !description || !max_attempts || !duration) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const quiz = await prisma.quizzes.findUnique({
      where: {
        quiz_id: quizId,
      },
      select: {
        title: true,
        description: true,
        max_attempts: true,
        duration: true,
        course_id: true,
      },
    });

    const update = await prisma.quizzes.update({
      where: {
        quiz_id: quizId,
      },
      data: {
        title: title || quiz.title,
        description: description || quiz.description,
        max_attempts: max_attempts || quiz.max_attempts,
        duration: duration || quiz.duration,
      },
    });

    if (!update) {
      return res.status(400).json({
        error: "Error while try to update quiz",
      });
    }
    return res.status(200).json({
      message: "Quiz updated successfully ",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const { userEmail, subject, text } = req.body;
    if (!userEmail || !subject || !text) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    await sendMail(userEmail, subject, text);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMyContentRequests = async (req, res) => {
  try {
    const { instructorId } = req.query;
    if (!instructorId) {
      return res.status(400).json({
        error: "Instructor Id Required",
      });
    }
    const mylessons = await prisma.lessons.findMany({
      where: {
        course: {
          instructor_id: parseInt(instructorId),
        },
      },
      select: {
        lesson_id: true,
      },
    });

    const lessonIds = mylessons.map((lesson) => lesson.lesson_id);
    const lessons = await prisma.lessonsApprovel.findMany({
      where: {
        lesson_id: {
          in: lessonIds,
        },
      },
      select: {
        lesson_id: true,
        apporval_date: true,
        status: true,
        lessoon_approvel_id: true,
        reason: true,
        lesson: {
          select: {
            title: true,
            description: true,
            lesson_order: true,
            video_url: true,
            attachment: true,
          },
        },
      },
    });
    const myarticles = await prisma.article.findMany({
      where: {
        author: {
          user_id: parseInt(instructorId),
        },
      },
      select: {
        article_id: true,
      },
    });

    const articleIds = myarticles.map((article) => article.article_id);

    const articles = await prisma.articleApporvel.findMany({
      where: {
        article_id: {
          in: articleIds,
        },
      },
      select: {
        article_approvel_id: true,
        apporval_date: true,
        status: true,
        reason: true,
        article_id: true,
        article: {
          select: {
            title: true,
            excerpt: true,
          },
        },
      },
    });
    const lessonsFormat = lessons.map((lesson) => {
      return {
        apporval_date: new Date(lesson.apporval_date).toLocaleDateString(),
        status: lesson.status,
        lesson_id: lesson.lesson_id,
        reason: lesson.reason,
        lessoon_approvel_id: lesson.lessoon_approvel_id,
        lesson: {
          ...lesson.lesson,
        },
      };
    });

    const articlesFormat = articles.map((article) => {
      return {
        apporval_date: article.apporval_date.toLocaleDateString(),
        status: article.status,
        article_approvel_id: article.article_approvel_id,
        article_id: article.article_id,
        reason: article.reason,
        article: {
          ...article.article,
        },
      };
    });

    const requests = {
      lessons: lessonsFormat,
      articles: articlesFormat,
    };

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { lessonId, instructorId, courseId } = req.query;
    await isHavePermession(parseInt(courseId), parseInt(instructorId));
    const deleteLesson = await prisma.lessons.delete({
      where: {
        lesson_id: parseInt(lessonId),
      },
      select: {
        video_url: true,
        attachment: true,
      },
    });
    const publicId = deleteLesson.video_url.split("/").pop().split(".")[0];
    const publicIdAttachment = deleteLesson.attachment
      .split("/")
      .pop()
      .split(".")[0];

    if (deleteLesson) {
      const deleteVideo = await cloudinary.uploader.destroy(publicId);
      const deleteAttachment = await cloudinary.uploader.destroy(
        publicIdAttachment
      );
      if (!deleteVideo || !deleteAttachment) {
        return res.status(400).json({
          error: "Error while delete the lesson",
        });
      }
      return res.status(200).json({
        message: "lesson deleted",
      });
    } else {
      return res.status(400).json({
        error: "Error while delete the lesson",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getLearnerScores = async (req, res) => {
  const userId = req.user.userId;
  const { type = "quiz", page = 1, limit = 10 } = req.query;
  const limitNumber = parseInt(limit);
  const pageNumber = parseInt(page);

  const skip = (pageNumber - 1) * limitNumber;

  const instructorCourses = await prisma.courses.findMany({
    where: {
      instructor_id: userId,
    },
    select: {
      course_id: true,
    },
  });
  const instructorCourseIds = instructorCourses.map(
    (course) => course.course_id
  );

  if (type === "quiz") {
    const quizScores = await prisma.attempt.findMany({
      where: {
        quiz: {
          course_id: {
            in: instructorCourseIds,
          },
        },
      },
      select: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
          },
        },
        attempt_id: true,
        score: true,
        start_time: true,
        quiz: { select: { title: true, total_marks: true } },
      },
      orderBy: { start_time: "desc" },
      skip,
      take: limitNumber,
    });

    const total = await prisma.attempt.count({
      where: {
        quiz: {
          course_id: {
            in: instructorCourseIds,
          },
        },
      },
    });

    const data = quizScores.map((q) => ({
      id: q.attempt_id,

      type: "quiz",
      title: q.quiz.title,
      score: q.score,
      max_score: q.quiz.total_marks,
      submitted_at: q.start_time,
      user: {
        user_id: q.user.user_id,
        full_name: q.user.full_name,
        email: q.user.email,
      },
    }));

    return res.status(200).json({
      data,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  }

  const assignmentScores = await prisma.assignmentSubmission.findMany({
    where: {
      assignment: {
        course_id: {
          in: instructorCourseIds,
        },
      },
    },
    select: {
      student: {
        select: {
          user_id: true,
          full_name: true,
          email: true,
        },
      },
      submission_id: true,
      grade: true,
      submitted_at: true,
      assignment: { select: { title: true, points: true } },
    },
    orderBy: { submitted_at: "desc" },
    skip,
    take: limitNumber,
  });

  const total = await prisma.assignmentSubmission.count({
    where: {
      assignment: {
        course_id: {
          in: instructorCourseIds,
        },
      },
    },
  });

  const data = assignmentScores.map((a) => {
    return {
      id: a.submission_id,
      type: "assignment",
      title: a.assignment.title,
      score: a.grade,
      max_score: a.assignment.points,
      submitted_at: a.submitted_at,
      user: {
        user_id: a.student.user_id,
        full_name: a.student.full_name,
        email: a.student.email,
      },
    };
  });
  return res.status(200).json({
    data,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  });
};
export const coursesStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        error: "Instructor Id required",
      });
    }

    const courses = await prisma.courses.findMany({
      where: {
        instructor_id: userId,
      },
      select: {
        title: true,
        course_id: true,
        required_marks: true,
        quizzes: {
          select: {
            total_marks: true,
          },
        },
        assignments: {
          select: {
            points: true,
          },
        },
      },
    });

    const coursesWithTotalMarks = courses.map((course) => {
      const totalQuizzesMarks = course.quizzes.reduce(
        (sum, quiz) => sum + quiz.total_marks,
        0
      );
      const totalAssignmentsMarks = course.assignments.reduce(
        (sum, assignment) => sum + assignment.points,
        0
      );
      return {
        course_id: course.course_id,
        title: course.title,
        required_marks: course.required_marks,

        totalMarks: totalQuizzesMarks + totalAssignmentsMarks,
        quizzesMarks: totalQuizzesMarks,
        assignmentsMarks: totalAssignmentsMarks,
      };
    });

    return res.status(200).json({
      courses: coursesWithTotalMarks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
