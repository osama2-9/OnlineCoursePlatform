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

    return res.status(201).json({
      message: "Article created successfully",
      article: newArticle,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const getArticalById = async (req, res) => {
  try {
    const { articalId } = req.params;
    const articalIdInt = parseInt(articalId);
    if (!articalId) {
      return res.status(400).json({
        error: "Article Id is required",
      });
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
        author: {
          select: {
            full_name: true,
          },
        },
        author_id: true,
        tags: true,
        title: true,
        comments: true,
      },
    });

    if (!article) {
      return res.status(400).json({
        error: "Articel not found",
      });
    }
    return res.status(200).json({
      article,
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    const where = {
      ...categoryFilter,
      ...tagFilter,
      ...searchFilter,
    };

    const totalArticles = await prisma.article.count({ where });

    const articles = await prisma.article.findMany({
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
        comments: true,
        author_id:true
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalArticles / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      success: true,
      data: articles,
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
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};