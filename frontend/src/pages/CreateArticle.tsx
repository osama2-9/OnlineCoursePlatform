import React, { useState } from "react";
import {
  PlusCircle,
  Trash2,
  Image,
  Code,
  AlertTriangle,
  Info,
  Quote,
  Heading,
  Minus,
  Check,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { API } from "../API/ApiBaseUrl";
import { useGetCategories } from "../hooks/useGetCategories";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const contentStatusOptions = ["draft", "published", "archived", "deleted"];
const articleTypeOptions = [
  "tutorial",
  "howto",
  "explainer",
  "news",
  "opinion",
  "reference",
];

interface ContentBlock {
  id: number;
  block_type: string;
  order: number;
  content: string | null;
  code_language: string | null;
  code_content: string | null;
  image_url: string | null;
  image_caption: string | null;
}

interface Articel {
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  content_type: string;
  category: string;
  tags: string[];
  featured_image: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  content_blocks: ContentBlock[];
}

const CreateArticel = () => {
  const { user } = useAuth();
  const [article, setArticle] = useState<Articel>({
    title: "",
    slug: "",
    excerpt: "",
    status: "draft",
    content_type: "tutorial",
    category: "",
    tags: [],
    featured_image: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: [],
    content_blocks: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<
    { category_id: number; name: string }[]
  >([]);
  const [newTag, setNewTag] = useState<string>("");
  const [newKeyword, setNewKeyword] = useState<string>("");
  const { categoriesOptions, error, isLoading } = useGetCategories();

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setArticle({
      ...article,
      title,
      slug: generateSlug(title),
      seo_title: title,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !article.tags.includes(newTag.trim())) {
      setArticle({
        ...article,
        tags: [...article.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setArticle({
      ...article,
      tags: article.tags.filter((t) => t !== tag),
    });
  };

  const handleAddKeyword = () => {
    if (
      newKeyword.trim() &&
      !article.seo_keywords.includes(newKeyword.trim())
    ) {
      setArticle({
        ...article,
        seo_keywords: [...article.seo_keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setArticle({
      ...article,
      seo_keywords: article.seo_keywords.filter((k) => k !== keyword),
    });
  };

  const handleAddCategory = (category: {
    category_id: number;
    name: string;
  }) => {
    if (!categories.find((c) => c.category_id === category.category_id)) {
      setCategories([...categories, category]);
    }
  };
  const handleRemoveCategory = (categoryId: number) => {
    setCategories(categories.filter((c) => c.category_id !== categoryId));
  };
  const handleAddContentBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: Date.now(),
      block_type: type,
      order: article.content_blocks.length,
      content: type === "TEXT" ? "" : null,
      code_language: type === "CODE" ? "javascript" : null,
      code_content: type === "CODE" ? "" : null,
      image_url: type === "IMAGE" ? "" : null,
      image_caption: type === "IMAGE" ? "" : null,
    };

    setArticle({
      ...article,
      content_blocks: [...article.content_blocks, newBlock],
    });
  };

  const handleUpdateBlock = (id: number, field: string, value: string) => {
    setArticle({
      ...article,
      content_blocks: article.content_blocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block
      ),
    });
  };

  const handleRemoveBlock = (id: number) => {
    setArticle({
      ...article,
      content_blocks: article.content_blocks.filter((block) => block.id !== id),
    });
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...article.content_blocks];
    [newBlocks[index], newBlocks[index - 1]] = [
      newBlocks[index - 1],
      newBlocks[index],
    ];

    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    setArticle({
      ...article,
      content_blocks: newBlocks,
    });
  };

  const moveBlockDown = (index: number) => {
    if (index === article.content_blocks.length - 1) return;
    const newBlocks = [...article.content_blocks];
    [newBlocks[index], newBlocks[index + 1]] = [
      newBlocks[index + 1],
      newBlocks[index],
    ];

    newBlocks.forEach((block, idx) => {
      block.order = idx;
    });

    setArticle({
      ...article,
      content_blocks: newBlocks,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (categories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    if (article.content_blocks.length === 0) {
      alert("Please add at least one content block");
      return;
    }

    const formattedArticle = {
      userId: user?.userId,
      ...article,
      category: categories.map((c) => c.name).join(", "),
      categories: categories.map((c) => c.category_id),
      content:
        typeof article.content_blocks === "string"
          ? article.content_blocks
          : JSON.stringify(article.content_blocks),
      search_text: article.title + " " + article.excerpt,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/articels/create-articel`,
        {
          formattedArticle,
        },
        {
          withCredentials: true,
        }
      );

      const data = await res.data;
      if (data) {
        toast.success("Article Created Successfully! ");
      }
    } catch (error: any) {
      console.error("Error creating article:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("An error occurred while creating the article.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBlockIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <div className="w-6"></div>;
      case "CODE":
        return <Code size={16} className="text-gray-600" />;
      case "IMAGE":
        return <Image size={16} className="text-gray-600" />;
      case "WARNING":
        return <AlertTriangle size={16} className="text-gray-600" />;
      case "TIP":
        return <Info size={16} className="text-gray-600" />;
      case "QUOTE":
        return <Quote size={16} className="text-gray-600" />;
      case "HEADING":
        return <Heading size={16} className="text-gray-600" />;
      case "DIVIDER":
        return <Minus size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    return (
      <div
        key={block.id}
        className="relative mb-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {renderBlockIcon(block.block_type)}
            <span className="ml-2 font-medium text-gray-700">
              {block.block_type}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => moveBlockUp(index)}
              disabled={index === 0}
              className={`p-1 rounded hover:bg-gray-100 ${
                index === 0 ? "text-gray-300" : "text-gray-500"
              }`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveBlockDown(index)}
              disabled={index === article.content_blocks.length - 1}
              className={`p-1 rounded hover:bg-gray-100 ${
                index === article.content_blocks.length - 1
                  ? "text-gray-300"
                  : "text-gray-500"
              }`}
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => handleRemoveBlock(block.id)}
              className="p-1 rounded text-gray-500 hover:bg-gray-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {block.block_type === "TEXT" && (
          <textarea
            value={block.content || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "content", e.target.value)
            }
            placeholder="Enter your text content here..."
            className="w-full p-2 border border-gray-300 rounded-md min-h-32"
          />
        )}

        {block.block_type === "HEADING" && (
          <input
            type="text"
            value={block.content || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "content", e.target.value)
            }
            placeholder="Enter heading text..."
            className="w-full p-2 border border-gray-300 rounded-md font-bold text-lg"
          />
        )}

        {block.block_type === "CODE" && (
          <div className="space-y-2">
            <select
              value={block.code_language || "javascript"}
              onChange={(e) =>
                handleUpdateBlock(block.id, "code_language", e.target.value)
              }
              className="block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="typescript">TypeScript</option>
              <option value="sql">SQL</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
            </select>
            <textarea
              value={block.code_content || ""}
              onChange={(e) =>
                handleUpdateBlock(block.id, "code_content", e.target.value)
              }
              placeholder="Enter your code here..."
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm min-h-40 bg-gray-50"
            />
          </div>
        )}

        {block.block_type === "IMAGE" && (
          <div className="space-y-2">
            <input
              type="text"
              value={block.image_url || ""}
              onChange={(e) =>
                handleUpdateBlock(block.id, "image_url", e.target.value)
              }
              placeholder="Enter image URL..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={block.image_caption || ""}
              onChange={(e) =>
                handleUpdateBlock(block.id, "image_caption", e.target.value)
              }
              placeholder="Enter image caption (optional)..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {block.image_url && (
              <div className="mt-2 border rounded-md p-2 bg-gray-50">
                <img
                  src="/api/placeholder/400/320"
                  alt="Image preview"
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
          </div>
        )}

        {(block.block_type === "WARNING" ||
          block.block_type === "TIP" ||
          block.block_type === "QUOTE") && (
          <textarea
            value={block.content || ""}
            onChange={(e) =>
              handleUpdateBlock(block.id, "content", e.target.value)
            }
            placeholder={`Enter your ${block.block_type.toLowerCase()} content here...`}
            className="w-full p-2 border border-gray-300 rounded-md min-h-24 bg-gray-50"
          />
        )}

        {block.block_type === "DIVIDER" && (
          <div className="py-2">
            <hr className="border-t-2 border-gray-200" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-8xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">
              Create New Uplarn Article
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Article Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={article.title}
                    onChange={handleTitleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Enter a clear, descriptive title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={article.slug}
                    onChange={(e) =>
                      setArticle({ ...article, slug: e.target.value })
                    }
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="article-url-slug"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be used in the article URL: uplarn.com/articles/
                    {article.slug}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="excerpt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Excerpt (max 300 characters)
                  </label>
                  <textarea
                    id="excerpt"
                    value={article.excerpt || ""}
                    onChange={(e) =>
                      setArticle({ ...article, excerpt: e.target.value })
                    }
                    maxLength={300}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Write a brief, engaging summary of your article"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {article.excerpt ? 300 - article.excerpt.length : 300}{" "}
                    characters remaining
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Content Blocks
                  </h2>

                  {article.content_blocks.map((block, index) =>
                    renderContentBlock(block, index)
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("TEXT")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Text
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("HEADING")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("CODE")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Code
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("IMAGE")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("WARNING")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Warning
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("TIP")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Tip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("QUOTE")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddContentBlock("DIVIDER")}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                    >
                      <PlusCircle size={16} className="mr-1" /> Divider
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Publishing Options
                  </h3>

                  <div className="mb-4">
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Article Status
                    </label>
                    <select
                      id="status"
                      value={article.status}
                      onChange={(e) =>
                        setArticle({ ...article, status: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {contentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="content_type"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Article Type
                    </label>
                    <select
                      id="content_type"
                      value={article.content_type}
                      onChange={(e) =>
                        setArticle({ ...article, content_type: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {articleTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="featured_image"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Featured Image URL
                    </label>
                    <input
                      type="text"
                      id="featured_image"
                      value={article.featured_image || ""}
                      onChange={(e) =>
                        setArticle({
                          ...article,
                          featured_image: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="https://example.com/image.jpg"
                    />
                    {article.featured_image && (
                      <div className="mt-2 border rounded-md p-2 bg-gray-50">
                        <img
                          src={article.featured_image}
                          alt="Featured image preview"
                          className="w-full h-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Categories & Tags
                  </h3>

                  {isLoading ? (
                    <Loader2
                      className="animate-spin"
                      color="#4b5563"
                      size={18}
                    />
                  ) : (
                    <>
                      <div className="mb-4">
                        {error ? (
                          <p className="text-red-600 text-sm">
                            {error.message}
                          </p>
                        ) : (
                          <>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categories
                            </label>
                            <div className="mb-2">
                              {categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {categories.map((category) => (
                                    <span
                                      key={category.category_id}
                                      className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                                    >
                                      {category.name}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveCategory(
                                            category.category_id
                                          )
                                        }
                                        className="ml-1 text-gray-600 hover:text-gray-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 mb-2">
                                  No categories selected
                                </p>
                              )}
                            </div>
                          </>
                        )}

                        <select
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          onChange={(e) => {
                            const categoryId = parseInt(e.target.value);
                            if (categoryId) {
                              const category = categoriesOptions.find(
                                (c) => c.category_id === categoryId
                              );
                              if (category) handleAddCategory(category);
                            }
                            e.target.value = "";
                          }}
                          value=""
                        >
                          <option value="">Select a category...</option>
                          {categoriesOptions.map((category) => (
                            <option
                              key={category.category_id}
                              value={category.category_id}
                              disabled={categories.some(
                                (c) => c.category_id === category.category_id
                              )}
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddTag())
                        }
                        className="flex-grow p-2 border border-gray-300 rounded-l-lg"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    SEO Settings
                  </h3>

                  <div className="mb-4">
                    <label
                      htmlFor="seo_title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seo_title"
                      value={article.seo_title || ""}
                      onChange={(e) =>
                        setArticle({ ...article, seo_title: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="SEO optimized title (default: article title)"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="seo_description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      SEO Description
                    </label>
                    <textarea
                      id="seo_description"
                      value={article.seo_description || ""}
                      onChange={(e) =>
                        setArticle({
                          ...article,
                          seo_description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Meta description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Keywords
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {article.seo_keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="ml-1 text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddKeyword())
                        }
                        className="flex-grow p-2 border border-gray-300 rounded-l-lg"
                        placeholder="Add a keyword"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                  >
                    <Check size={18} className="mr-2" />
                    {loading ? (
                      <Loader2
                        className="animate-spin"
                        size={15}
                        color="#FFFFFF"
                      />
                    ) : (
                      "Create Article"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateArticel;
