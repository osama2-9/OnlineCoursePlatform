import { auth } from "google-auth-library";
import { prisma } from "../prisma/prismaClint.js";

export const getApprovleRequestContent = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        error: "User id is required",
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

    if (user.role !== "moderator") {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const pendingLessons = await prisma.lessons.findMany({
      where: {
        is_lesson_approved: false,
      },
      select: {
        lesson_id: true,
      },
    });

    const lessonsIds = pendingLessons.map((lesson) => lesson.lesson_id);

    const lessonsApproveRequests = await prisma.lessonsApprovel.findMany({
      where: {
        lesson_id: { in: lessonsIds },
      },
      select: {
        lesson_id: true,
        lessoon_approvel_id: true,
        status: true,

        lesson: {
          select: {
            title: true,
            description: true,
            created_at: true,
            course: {
              select: {
                instructor: {
                  select: {
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const pendingArticles = await prisma.article.findMany({
      where: {
        is_article_approved: false,
      },
      select: {
        article_id: true,
      },

      skip: (page - 1) * limit,
      take: limit,
    });

    const articlesIds = pendingArticles.map((article) => article.article_id);

    const articlesApproveRequests = await prisma.articleApporvel.findMany({
      where: {
        article_id: { in: articlesIds },
      },
      select: {
        article_id: true,
        article_approvel_id: true,
        status: true,
        article: {
          select: {
            title: true,
            excerpt: true,
            created_at: true,
            author: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (!articlesApproveRequests) {
      return res.status(404).json({
        error: "No articles found",
      });
    }

    const requests = [
      ...articlesApproveRequests.map((req) => {
        return {
          contentId: req.article_id,
          content_approbvel_Id: req.article_approvel_id,
          title: req.article.title,
          description: req.article.excerpt,
          author_name: req.article.author.full_name,
          created_at: req.article.created_at,
          type: "article",
          status: req.status,
        };
      }),
      ...lessonsApproveRequests.map((req) => {
        return {
          contentId: req.lesson_id,
          content_approbvel_Id: req.lessoon_approvel_id,
          title: req.lesson.title,
          description: req.lesson.description,
          author_name: req.lesson.course.instructor.full_name,
          created_at: req.lesson.created_at,
          type: "lesson",
          status: req.status,
        };
      }),
    ];

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

export const getSelectedContentDetails = async (req, res) => {
  try {
    const { contentId, type } = req.query;
    if (!contentId || !type) {
      return res.status(400).json({
        error: "Content id and type are required",
      });
    }
    let contentDeatils;
    if (type == "lesson") {
      contentDeatils = await prisma.lessons.findUnique({
        where: {
          lesson_id: parseInt(contentId),
        },
        select: {
          lesson_id: true,
          title: true,
          description: true,
          content: true,
          attachment: true,
          video_url: true,
          created_at: true,
          lessonsApprovel: {
            select: {
              lessoon_approvel_id: true,
              status: true,
            },
          },
          course: {
            select: {
              instructor: {
                select: {
                  full_name: true,
                },
              },
            },
          },
        },
      });
    } else if (type == "article") {
      contentDeatils = await prisma.article.findUnique({
        where: {
          article_id: parseInt(contentId),
        },
        select: {
          article_id: true,
          title: true,
          excerpt: true,
          seo_description: true,
          seo_title: true,
          featured_image: true,
          tags: true,
          created_at: true,
          author: {
            select: {
              full_name: true,
            },
          },
          content_blocks: {
            select: {
              content: true,
              image_url: true,
              image_caption: true,
              video_url: true,
            },
          },
          article_approvel: {
            where: {
              article_id: parseInt(contentId),
            },
            select: {
              article_approvel_id: true,
              status: true,
            },
          },
        },
      });
    }

    if (!contentDeatils) {
      return res.status(404).json({
        error: "Content not found",
      });
    }
    if (contentDeatils && type == "article") {
      return res.status(200).json({
        ...contentDeatils,
        type: "article",
        status: contentDeatils.article_approvel[0].status,
        author_name: contentDeatils.author.full_name,
        article_approvel_id:
          contentDeatils.article_approvel[0].article_approvel_id,
      });
    }
    if (contentDeatils && type == "lesson") {
      return res.status(200).json({
        ...contentDeatils,
        type: "lesson",
        author_name: contentDeatils.course.instructor.full_name,
        status: contentDeatils.lessonsApprovel[0].status,
        lesson_approvel_id:
          contentDeatils.lessonsApprovel[0].lessoon_approvel_id,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const approveRequest = async (req, res) => {
  try {
    let updateLessonsStatus, updateArticleStatus;
    const { Id, status, approved_by, type, reason } = req.body;
    if (!Id || !status || !approved_by) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }
    if (type == "lesson") {
      updateLessonsStatus = await prisma.lessonsApprovel.update({
        where: {
          lessoon_approvel_id: Id,
        },
        data: {
          status: status,
          approved_by: approved_by,
          apporval_date: new Date(),
          reason: reason,
        },
      });
      await prisma.lessons.update({
        where: {
          lesson_id: updateLessonsStatus.lesson_id,
        },
        data: {
          is_lesson_approved: true,
        },
      });
    } else if (type == "article") {
      updateArticleStatus = await prisma.articleApporvel.update({
        where: {
          article_approvel_id: Id,
        },
        data: {
          status: status,
          approved_by: approved_by,
          apporval_date: new Date(),
          reason: reason,
        },
      });
      await prisma.article.update({
        where: {
          article_id: updateArticleStatus.article_id,
        },
        data: {
          is_article_approved: true,
        },
      });
    }

    if (updateLessonsStatus || updateArticleStatus) {
      return res.status(200).json({
        message: "Status updated successfully",
      });
    } else {
      return res.status(400).json({
        error: "Error while updating status",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const rejecetRequest = async (req, res) => {
  try {
    const { Id, status, approved_by, type, reason } = req.body;
    if (!Id || !status || !approved_by) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }
    if (type == "lesson") {
      await prisma.lessonsApprovel.update({
        where: {
          lessoon_approvel_id: Id,
        },
        data: {
          status: status,
          approved_by: approved_by,
          apporval_date: new Date(),
          reason: reason,
        },
      });
    } else if (type == "article") {
      await prisma.articleApporvel.update({
        where: {
          article_approvel_id: Id,
        },
        data: {
          status: status,
          approved_by: approved_by,
          apporval_date: new Date(),
          reason: reason,
        },
      });
    }

    return res.status(200).json({
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
