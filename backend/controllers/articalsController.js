import { generateArticleSEOSetting } from "../openAI/openAi.js";
import { prisma } from "../prisma/prismaClint.js";

export const createCategory = async (req, res) => {
  try {
    const { userId, name, slug, description } = req.body;
    if (!userId || !name || !slug || !description) {
      return res.status(400).json({
        error: "missing required inputs",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        role: true,
      },
    });
    if (user.role === "learner") {
      return res.status(401).json({
        error: "You can't do this action",
      });
    }
    const sameName = await prisma.category.findFirst({
      where: {
        name: name,
      },
    });
    if (sameName) {
      return res.status(400).json({
        error: "Category already avilable",
      });
    }
    const newCategory = await prisma.category.create({
      data: {
        name: name,
        slug: slug,
        description: description,
      },
    });
    if (!newCategory) {
      return res.status(400).json({
        error: "Error while add category",
      });
    }
    return res.status(201).json({
      message: "Category created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        category_id: true,
      },
    });
    if (categories.length === 0) {
      return res.status(400).json({
        error: "No categories found",
      });
    }
    if (!categories) {
      return res.status(400).json({
        error: "No categories found",
      });
    }

    return res.status(200).json({
      categories: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const createArtical = async (req, res) => {
  try {
    const {
      userId,
      title,
      slug,
      content,
      search_text,
      excerpt,
      status,
      content_type,
      category,
      tags,
      featured_image,
      seo_title,
      seo_description,
      seo_keywords,
      content_blocks,
    } = req.body.formattedArticle;

    if (!userId) {
      return res.status(400).json({
        error: "No user ID found",
      });
    }

    if (
      !title ||
      !content ||
      !slug ||
      !excerpt ||
      !category ||
      !content_type ||
      !seo_title ||
      !seo_description ||
      !seo_keywords ||
      !content_blocks
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        role: true,
      },
    });

    if (user.role === "learner") {
      return res.status(400).json({
        error: "You don't have permission to create articles",
      });
    }

    const newArticle = await prisma.$transaction(
      async (prisma) => {
        const article = await prisma.article.create({
          data: {
            author_id: userId,
            title,
            slug,
            content,
            search_text: search_text || "",
            excerpt: excerpt || null,
            status: status || "draft",
            content_type: content_type || "tutorial",
            category,
            tags: tags || [],
            featured_image: featured_image || null,
            seo_title: seo_title || title,
            seo_description: seo_description || excerpt || null,
            seo_keywords: seo_keywords || [],
            word_count:
              typeof content === "string"
                ? content.length
                : JSON.stringify(content).length,
          },
        });

        if (Array.isArray(content_blocks) && content_blocks.length > 0) {
          await Promise.all(
            content_blocks.map((block, index) => {
              return prisma.contentBlock.create({
                data: {
                  article_id: article.article_id,
                  order: index + 1,
                  block_type: block.block_type,
                  content: block.content,
                  code_language: block.code_language,
                  code_content: block.code_content,
                  image_url: block.image_url,
                  image_caption: block.image_caption,
                  video_url: block.video_url,
                  video_duration: block.video_duration,
                  quiz_id: block.quiz_id,
                },
              });
            })
          );
        }

        return article;
      },
      {
        timeout: 60000,
      }
    );
    if (newArticle) {
      const newArticleApproveRequest = await prisma.articleApporvel.create({
        data: {
          article_id: newArticle.article_id,
          status: "pending",
        },
      });
      if (newArticleApproveRequest) {
        return res.status(201).json({
          message:
            "New article added to your course please wait to be approved",
        });
      }
    } else {
      return res.status(400).json({
        error: "Error while trying to add article",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getArticalById = async (req, res) => {
  try {
    const { articalId, userId } = req.params;

    const articalIdInt = parseInt(articalId);
    let userIdInt = null;

    if (userId && userId !== "undefined") {
      userIdInt = parseInt(userId);
    }

    const article = await prisma.article.findUnique({
      where: {
        article_id: articalIdInt,
      },
      select: {
        article_id: true,
        categories: true,
        category: true,
        content_blocks: true,
        created_at: true,
        excerpt: true,
        featured_image: true,
        content_type: true,
        content: true,
        comments: {
          select: {
            author: {
              select: {
                full_name: true,
              },
            },
            comment_id: true,
            content: true,
            created_at: true,
          },
        },
        author: {
          select: {
            full_name: true,
          },
        },
        author_id: true,
        tags: true,
        title: true,
      },
    });

    let allowLike = false;
    let isBookmarked = false;

    if (userIdInt) {
      const isUserLiked = await prisma.like.findFirst({
        where: {
          article_id: articalIdInt,
          user_id: userIdInt,
        },
      });
      allowLike = !isUserLiked;

      const isArticleBookmarked = await prisma.bookmark.findFirst({
        where: {
          article_id: articalIdInt,
          user_id: userIdInt,
        },
      });
      isBookmarked = !!isArticleBookmarked;
    }

    const likes = await prisma.like.count({
      where: {
        article_id: articalIdInt,
      },
    });

    if (!article) {
      return res.status(404).json({
        error: "Article not found",
      });
    }

    return res.status(200).json({
      article,
      likes_count: likes,
      allowLike,
      isBookmarked,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const comments = await prisma.comment.findMany({
      where: {
        article_id: parseInt(articleId),
      },
      select: {
        comment_id: true,
        content: true,
        author: {
          select: {
            full_name: true,
            user_id: true,
          },
        },
        created_at: true,
      },
    });
    if (!comments) {
      return res.status(404).json({
        error: "Comments not found",
      });
    }
    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sort || "latest";
    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};
    const tagFilter = req.query.tag ? { tags: { has: req.query.tag } } : {};
    const searchFilter = req.query.search
      ? {
          OR: [
            { title: { contains: req.query.search, mode: "insensitive" } },
            { excerpt: { contains: req.query.search, mode: "insensitive" } },
          ],
        }
      : {};

    let where = {
      is_article_approved: true,
      ...categoryFilter,
      ...tagFilter,
      ...searchFilter,
    };
    let orderBy = { created_at: "desc" };

    if (sortBy === "popular") {
      orderBy = { likes: { _count: "desc" } };
    } else if (sortBy === "mostDiscussed") {
      orderBy = { comments: { _count: "desc" } };
    }

    const [totalArticles, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        select: {
          article_id: true,
          categories: true,
          category: true,
          content_blocks: true,
          created_at: true,
          excerpt: true,
          featured_image: true,
          content_type: true,
          content: true,
          author: {
            select: {
              full_name: true,
            },
          },
          tags: true,
          title: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
          author_id: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const articlesWithCounts = articles.map((article) => ({
      ...article,
      likes_count: article._count.likes,
      comments_count: article._count.comments,
      _count: undefined,
    }));

    const totalPages = Math.ceil(totalArticles / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: articlesWithCounts,
      pagination: {
        totalArticles,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { userId, articleId, comment } = req.body;
    const articleIdInt = parseInt(articleId);
    if (!userId || !articleId || !comment) {
      return res.status(400).json({
        error: "Missing required inputs",
      });
    }
    const article = await prisma.article.findUnique({
      where: {
        article_id: articleIdInt,
      },
    });
    if (!article) {
      return res.status(400).json({
        error: "No Article found",
      });
    }
    const createComment = await prisma.comment.create({
      data: {
        article_id: articleIdInt,
        content: comment,
        author_id: userId,
      },
    });

    if (!createComment) {
      return res.status(400).json({
        error: "can't add comment please try again",
      });
    }

    return res.status(201).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { userId, articleId, commentId } = req.params;
    const articleIdInt = parseInt(articleId);
    const commentIdInt = parseInt(commentId);
    const userIdInt = parseInt(userId);
    if (!userId || !articleId || !commentId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const article = await prisma.article.findUnique({
      where: {
        article_id: articleIdInt,
      },
      select: {
        article_id: true,
      },
    });
    if (!article) {
      return res.status(404).json({
        error: "Article not found",
      });
    }
    const comment = await prisma.comment.findUnique({
      where: {
        comment_id: commentIdInt,
        article_id: articleIdInt,
        author_id: userIdInt,
      },
    });
    if (!comment) {
      return res.status(400).json({
        error: "Comment not found",
      });
    }

    const deleteComment = await prisma.comment.deleteMany({
      where: {
        comment_id: commentIdInt,
        article_id: articleIdInt,
        author_id: userIdInt,
      },
    });
    if (!deleteComment) {
      return res.status(400).json({
        success: false,
        error: "Can't delete comment please try again",
      });
    }

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

export const updateComment = async (req, res) => {
  try {
    const { articalId, userId, commentId, comment } = req.body;
    const articleIdInt = parseInt(articalId);
    const commentIdInt = parseInt(commentId);
    const userIdInt = parseInt(userId);
    if (!userId || !articalId || !commentId || !comment) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const article = await prisma.article.findUnique({
      where: {
        article_id: articleIdInt,
      },
      select: {
        article_id: true,
      },
    });
    if (!article) {
      return res.status(404).json({
        error: "Article not found",
      });
    }
    const findComment = await prisma.comment.findUnique({
      where: {
        comment_id: commentIdInt,
        article_id: articleIdInt,
        author_id: userIdInt,
      },
    });
    if (!findComment) {
      return res.status(400).json({
        error: "Comment not found",
      });
    }
    const updateComment = await prisma.comment.update({
      where: {
        comment_id: commentIdInt,
        article_id: articleIdInt,
        author_id: userIdInt,
      },
      data: {
        content: comment,
      },
    });
    if (!updateComment) {
      return res.status(400).json({
        error: "Can't update comment please try again",
      });
    }
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

export const addLike = async (req, res) => {
  try {
    const { userId, articleId } = req.body;
    if (!userId || !articleId) {
      return res.status(400).json({
        error: "Missing required data",
      });
    }
    const article = await prisma.article.findUnique({
      where: {
        article_id: parseInt(articleId),
      },
    });

    if (!article) {
      return res.status(400).json({
        error: "Article not found",
      });
    }
    const addLike = await prisma.like.create({
      data: {
        article_id: parseInt(articleId),
        user_id: parseInt(userId),
      },
    });

    if (!addLike) {
      return res.status(400).json({
        error: "falied to add like ",
      });
    }

    return res.status(201).json({
      add_like_success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const removeLike = async (req, res) => {
  try {
    const { articleId, userId } = req.params;
    const articleIdInt = parseInt(articleId);
    const userIdInt = parseInt(userId);

    if (!articleId || !userId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const like = await prisma.like.findFirst({
      where: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    if (!like) {
      return res.status(400).json({
        remove_like_success: false,
      });
    }

    await prisma.like.deleteMany({
      where: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    return res.status(200).json({
      remove_like_success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const addBookmark = async (req, res) => {
  try {
    const { articleId, userId } = req.body;
    const articleIdInt = parseInt(articleId);
    const userIdInt = parseInt(userId);

    if (!articleIdInt || !userIdInt) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const article = await prisma.article.findUnique({
      where: {
        article_id: articleIdInt,
      },
    });

    if (!article) {
      return res.status(400).json({
        error: "Article not found",
      });
    }

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    if (existingBookmark) {
      return res.status(400).json({
        error: "Article already bookmarked",
      });
    }

    await prisma.bookmark.create({
      data: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    return res.status(201).json({
      add_bookmark_success: true,
      message: "Article bookmarked successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const { articleId, userId } = req.params;
    const articleIdInt = parseInt(articleId);
    const userIdInt = parseInt(userId);

    if (!articleIdInt || !userIdInt) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    if (!bookmark) {
      return res.status(400).json({
        remove_bookmark_success: false,
        error: "Bookmark not found",
      });
    }

    await prisma.bookmark.deleteMany({
      where: {
        article_id: articleIdInt,
        user_id: userIdInt,
      },
    });

    return res.status(200).json({
      remove_bookmark_success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getBookMarkedArticles = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userIdInt = parseInt(userId);

    if (!userIdInt) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        user_id: userIdInt,
      },
      select: {
        article_id: true,
      },
    });

    const articles = await prisma.article.findMany({
      where: {
        article_id: {
          in: bookmarks.map((bookmark) => bookmark.article_id),
        },
      },
      include: {
        author: {
          select: {
            full_name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formattedArticle = articles.map((articles) => {
      return {
        ...articles,
        likes_count: articles._count.likes,
        comments_count: articles._count.comments,
      };
    });
    return res.status(200).json({
      success: true,
      data: formattedArticle,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const seen = async (req, res) => {
  try {
    const { userId, articleId } = req.body;
    if (!userId || !articleId) {
      return res.status(400).json({
        error: "Missing required ids",
      });
    }
    const seen = await prisma.seen.findFirst({
      where: {
        user_id: userId,
        article_id: parseInt(articleId),
      },
    });
    if (!seen) {
      await prisma.seen.create({
        data: {
          user_id: userId,
          article_id: parseInt(articleId),
          seen_at: new Date(),
        },
      });
      return res.status(200).json({
        seen_success: true,
      });
    }
    return res.status(200).json({
      seen_success: false,
    });
  } catch (error) {
    console.log(error);
  }
};

export const generateSeoSettings = async (req, res) => {
  try {
    const { title, excerpt } = req.body;
    if (!title || !excerpt) {
      return res.status(400).json({
        error: "Please Provied, title, excerpt",
      });
    }
    const seoSettings = await generateArticleSEOSetting(title, excerpt);
    if (!seoSettings) {
      return res.status(400).json({
        error: "Failed to generate seo settings",
      });
    }
    return res.status(200).json({
      seoSettings: seoSettings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
