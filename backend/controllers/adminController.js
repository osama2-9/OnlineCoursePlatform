import { sendNewAccountEmail } from "../emails/WelcomeEmail.js";
import { prisma } from "../prisma/prismaClint.js";
import { passwordGenerator } from "../services/passwordGenerator.js";

export const createNewUser = async (req, res) => {
  try {
    const { full_name, email, role } = req.body;
    if (!full_name || !email || !role) {
      return res.status(400).json({
        error: "Please fill all feilds",
      });
    }
    const { hashedPassword, rawPassword } = await passwordGenerator();

    const findSameEmail = await prisma.users.findUnique({
      where: { email: email },
    });
    if (findSameEmail) {
      return res.status(400).json({
        error: "Email already used",
      });
    }

    const newUser = await prisma.users.create({
      data: {
        full_name: full_name,
        email: email,
        password_hash: hashedPassword,
        role: role,
      },
    });

    if (!newUser) {
      return res.status(400).json({
        error: "error while try to add new user",
      });
    }
    const loginUrl = `https://uplearn-website.vercel.app/login`;
    try {
      await sendNewAccountEmail(email, loginUrl, rawPassword);
    } catch (emailerror) {
      console.log(emailerror);
    }

    return res.status(201).json({
      message: "New user created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { user_id, full_name, email, role } = req.body;
    if (!user_id || !full_name || !email || !role) {
      return res.status(400).json({
        error: "Please fill all fields",
      });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: user_id },
    });

    const emailInUse = await prisma.users.findUnique({
      where: { email: email },
    });

    if (emailInUse && emailInUse.user_id !== user_id) {
      return res.status(400).json({
        error: "Email already used by another user",
      });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: user_id },
      data: {
        full_name: full_name || user.full_name,
        email: email || user.email,
        role: role || user.role,
      },
    });

    if (!updatedUser) {
      return res.status(400).json({
        error: "Error while updating user",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const userId = parseInt(user_id);

    if (!user_id) {
      return res.status(400).json({
        error: "No user found",
      });
    }

    await prisma.article.deleteMany({
      where: {
        author_id: userId,
      },
    });

    await prisma.enrollments.deleteMany({
      where: {
        user_id: userId,
      },
    });

    await prisma.payments.deleteMany({
      where: {
        user_id: userId,
      },
    });

    const deleteUser = await prisma.users.delete({
      where: {
        user_id: userId,
      },
    });

    if (!deleteUser) {
      return res.status(400).json({
        error: "Error while trying to delete user",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip: skip,
        take: pageSize,
        select: {
          user_id: true,
          full_name: true,
          email: true,
          role: true,
          created_at: true,
          lastLogin: true,
          is_active: true,
          authProvider: true,
        },
      }),
      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(totalUsers / pageSize);

    return res.status(200).json({
      users,
      pagination: {
        totalUsers,
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
export const accountActivation = async (req, res) => {
  try {
    const { user_id } = req.body;

    const userId = parseInt(user_id);
    const findUser = await prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!findUser) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: userId },
      data: {
        is_active: !findUser.is_active,
      },
    });

    return res.status(200).json({
      message: "Account activation status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getAdminDashboardSummary = async (req, res) => {
  try {
    const [
      totalLearners,
      totalInstructors,
      totalCourses,
      lastPayments,
      lastEnrollments,
    ] = await Promise.all([
      prisma.users.count({ where: { role: "learner" } }),
      prisma.users.count({ where: { role: "instructor" } }),
      prisma.courses.count(),
      await prisma.payments.findMany({
        where: {
          payment_status: "succeeded",
        },
        orderBy: {
          created_at: "desc",
        },
        select: {
          amount: true,
          created_at: true,
          user: {
            select: {
              full_name: true,
            },
          },
        },
        take: 2,
      }),
      await prisma.enrollments.findMany({
        orderBy: {
          enrollment_id: "desc",
        },
        take: 2,
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
      }),
    ]);

    if (
      totalCourses === null ||
      totalInstructors === null ||
      totalLearners === null
    ) {
      return res.status(400).json({
        error: "Failed to get some data",
      });
    }

    return res.status(200).json({
      cards: {
        totalLearners: totalLearners || 0,
        totalInstructors: totalInstructors || 0,
        totalCourses: totalCourses || 0,
        lastPayments: lastPayments.length ? lastPayments : [],
        lastEnrollments: lastEnrollments.length ? lastEnrollments : [],
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getTopEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await prisma.enrollments.findMany({
      include: {
        course: true,
      },
    });

    const coursesData = {};

    enrollments.forEach((enroll) => {
      if (coursesData[enroll.course_id]) {
        coursesData[enroll.course_id].count++;
      } else {
        coursesData[enroll.course_id] = {
          name: enroll.course.title,
          count: 1,
        };
      }
    });

    const result = Object.keys(coursesData)
      .map((courseId) => ({
        courseId,
        courseName: coursesData[courseId].name,
        count: coursesData[courseId].count,
      }))
      .sort((a, b) => b.count - a.count);

    const topThreeCourses = result.slice(0, 3);

    return res.status(200).json(topThreeCourses);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getInstructors = async (req, res) => {
  try {
    const instructors = await prisma.users.findMany({
      where: {
        role: "instructor",
      },
      select: {
        full_name: true,
        user_id: true,
      },
    });
    if (!instructors) {
      return res.status(400).json({
        error: "can't get instractors",
      });
    }
    return res.status(200).json({
      instructors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const searchAboutUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
        is_active: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: parseInt(userId),
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
      return res.status(403).json({
        error: "Cannot access this page",
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalQuizzes = await prisma.quizzes.count();

    const totalPages = Math.ceil(totalQuizzes / limitNumber);

    const quizzes = await prisma.quizzes.findMany({
      select: {
        title: true,
        is_published: true,
        description: true,
        max_attempts: true,
        created_at: true,
        quiz_id: true,
        course: {
          select: {
            title: true,
          },
        },
      },
      skip: skip,
      take: limitNumber,
    });

    return res.status(200).json({
      data: quizzes,
      pagination: {
        currentPage: pageNumber,
        totalPages: totalPages,
        totalQuizzes: totalQuizzes,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAnalystics = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== "admin") {
      return res.status(401).json({
        error: "Cannot access this page",
      });
    }

    const [
      payments,
      totalStudents,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      revenueTrend,
      enrollmentTrend,
      coursesByCategory,
      topCourses,
    ] = await Promise.all([
      prisma.payments.aggregate({
        where: {
          payment_status: "succeeded",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.users.count({
        where: {
          role: "learner",
        },
      }),
      prisma.courses.count(),
      prisma.enrollments.count(),
      prisma.enrollments.count({
        where: {
          status: "completed",
        },
      }),
      prisma.payments.groupBy({
        by: ["created_at"],
        where: {
          AND: [
            { payment_status: "succeeded" },
            {
              created_at: {
                gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
              },
            },
          ],
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          created_at: "asc",
        },
      }),
      prisma.enrollments.groupBy({
        by: ["enrollment_date"],
        where: {
          enrollment_date: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 3)),
          },
        },
        _count: true,
        orderBy: {
          enrollment_date: "asc",
        },
      }),
      prisma.courses.groupBy({
        by: ["category"],
        _count: {
          course_id: true,
        },
      }),
      prisma.courses.findMany({
        select: {
          course_id: true,
          title: true,
          enrollments: {
            select: {
              enrollment_id: true,
            },
            where: {
              status: { not: "dropped" },
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: [
          {
            enrollments: {
              _count: "desc",
            },
          },
        ],
        take: 5,
      }),
    ]);

    const monthlyRevenue = revenueTrend.reduce((acc, curr) => {
      const monthName = new Date(curr.created_at).toLocaleString("default", {
        month: "long",
      });
      const existingMonth = acc.find((item) => item.month === monthName);

      if (existingMonth) {
        existingMonth.amount += curr._sum.amount;
      } else {
        acc.push({
          month: monthName,
          amount: curr._sum.amount || 0,
        });
      }
      return acc;
    }, []);

    const monthlyEnrollments = enrollmentTrend.reduce((acc, curr) => {
      const monthName = new Date(curr.enrollment_date).toLocaleString(
        "default",
        {
          month: "long",
        }
      );
      const existingMonth = acc.find((item) => item.month === monthName);

      if (existingMonth) {
        existingMonth.count += curr._count;
      } else {
        acc.push({
          month: monthName,
          count: curr._count,
        });
      }
      return acc;
    }, []);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const sortByMonth = (a, b) =>
      months.indexOf(a.month) - months.indexOf(b.month);
    monthlyRevenue.sort(sortByMonth);
    monthlyEnrollments.sort(sortByMonth);

    const totalCompletionPercentage = parseFloat(
      totalEnrollments > 0
        ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2)
        : "0.00"
    );

    const allCategories = [
      "programming",
      "web-development",
      "data-science",
      "design",
      "marketing",
      "business",
      "finance",
      "artificial-intelligence",
      "cloud-computing",
      "cybersecurity",
      "project-management",
    ];

    const categoryCountMap = coursesByCategory.reduce((acc, cat) => {
      acc[cat.category || "uncategorized"] = cat._count.course_id;
      return acc;
    }, {});

    const completeCoursesByCategory = allCategories.map((category) => ({
      category,
      count: categoryCountMap[category] || 0,
    }));

    if (categoryCountMap["uncategorized"]) {
      completeCoursesByCategory.push({
        category: "uncategorized",
        count: categoryCountMap["uncategorized"],
      });
    }

    const processedTopCourses = topCourses.map((course) => ({
      title: course.title,
      enrollments: course.enrollments.length,
      rating:
        course.reviews.length > 0
          ? parseFloat(
              (
                course.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
                course.reviews.length
              ).toFixed(1)
            )
          : 0,
    }));

    return res.status(200).json({
      totalSuccessedPayments: payments._sum.amount || 0,
      totalStudents,
      totalCourses,
      totalCompletionPercentage,
      revenueTrend: monthlyRevenue,
      enrollmentTrend: monthlyEnrollments,
      coursesByCategory: completeCoursesByCategory,
      topPerformingCourses: processedTopCourses,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }

    const isAdmin = await prisma.users.findUnique({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        role: true,
      },
    });

    if (!isAdmin) {
      return res.status(401).json({
        error: "Can't access this page",
      });
    }
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const reviews = await prisma.reviews.findMany({
      select: {
        review_id: true,
        user: {
          select: {
            full_name: true,
          },
        },
        course: {
          select: {
            title: true,
            course_img: true,
          },
        },
        rating: true,
        review_text: true,
        created_at: true,
      },
      skip: parseInt(skip),
      take: parseInt(limit),
    });
    const totalReviews = await prisma.reviews.count();
    return res.status(200).json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getContentPublishRequests = async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    if (!userId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const isAdmin = await prisma.users.findUnique({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        role: true,
      },
    });
    if (!isAdmin || isAdmin.role !== "admin") {
      return res.status(401).json({
        error: "Can't access this page",
      });
    }

    const lessonsApproveRequests = await prisma.lessonsApprovel.findMany({
      select: {
        apporval_date: true,
        approved_by: true,
        reason: true,
        lessoon_approvel_id: true,
        status: true,
        lesson: {
          select: {
            lesson_id: true,
            title: true,
            video_url: true,
          },
        },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const articleApproveRequests = await prisma.articleApporvel.findMany({
      select: {
        apporval_date: true,
        approved_by: true,
        reason: true,
        article_approvel_id: true,
        status: true,
        article: {
          select: {
            title: true,
            article_id: true,
          },
        },
      },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const approvedBy = await prisma.users.findMany({
      where: {
        user_id: {
          in: [
            ...lessonsApproveRequests.map((request) => request.approved_by),
            ...articleApproveRequests.map((request) => request.approved_by),
          ].filter((id) => id !== null),
        },
      },
      select: {
        full_name: true,
        user_id: true,
      },
    });
    const lessonsApproveRequestsWithUser = lessonsApproveRequests.map(
      (request) => {
        const approver = approvedBy.find(
          (user) => user.user_id == request.approved_by
        );
        return {
          ...request,
          approved_by: approver ? approver.full_name : "Unknown",
        };
      }
    );
    const articleApproveRequestsWithUser = articleApproveRequests.map(
      (request) => {
        const approver = approvedBy.find(
          (user) => user.user_id == request.approved_by
        );
        return {
          ...request,
          approved_by: approver ? approver.full_name : "Unknown",
        };
      }
    );
    lessonsApproveRequestsWithUser.sort((a, b) => {
      return new Date(b.apporval_date) - new Date(a.apporval_date);
    });
    articleApproveRequestsWithUser.sort((a, b) => {
      return new Date(b.apporval_date) - new Date(a.apporval_date);
    });
    const allRequests = [
      ...lessonsApproveRequestsWithUser,
      ...articleApproveRequestsWithUser,
    ];

    return res.status(200).json({
      requests: allRequests,
    });
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
          required_marks: true,
          start_date: true,
          end_date: true,

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
