import React, { useState, useEffect } from "react";
import {
  Search,
  Clock,
  MessageSquare,
  Tag,
  Filter,
  ChevronDown,
  ArrowUp,
  Bell,
  User,
  Bookmark,
  TrendingUp,
} from "lucide-react";

export const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockPosts = [
    {
      article_id: 1,
      title: "Getting Started with React Hooks",
      slug: "getting-started-with-react-hooks",
      excerpt:
        "Learn how to use React Hooks to simplify your functional components and manage state effectively with practical examples.",
      status: "published",
      content_type: "tutorial",
      published_at: "2025-02-20T14:30:00Z",
      category: "Frontend",
      tags: ["React", "JavaScript", "Hooks"],
      featured_image: "/api/placeholder/800/400",
      word_count: 1200,
      author: {
        name: "Jane Doe",
        avatar: "/api/placeholder/40/40",
        role: "Senior Developer",
      },
      comments: Array(12),
      read_time: 12,
      popularity: 98,
    },
    {
      article_id: 2,
      title: "Building RESTful APIs with Node.js and Express",
      slug: "building-restful-apis-with-nodejs-express",
      excerpt:
        "A comprehensive guide to creating robust and scalable RESTful APIs using Node.js and Express framework with authentication and error handling.",
      status: "published",
      content_type: "tutorial",
      published_at: "2025-02-18T09:15:00Z",
      category: "Backend",
      tags: ["Node.js", "Express", "API", "REST"],
      featured_image: null,
      word_count: 2500,
      author: {
        name: "John Smith",
        avatar: "/api/placeholder/40/40",
        role: "Backend Engineer",
      },
      comments: Array(8),
      read_time: 18,
      popularity: 85,
    },
    {
      article_id: 3,
      title: "CSS Grid vs Flexbox: When to Use Each",
      slug: "css-grid-vs-flexbox",
      excerpt:
        "Understand the key differences between CSS Grid and Flexbox, and learn when to use each layout method for optimal results and responsive designs.",
      status: "published",
      content_type: "explainer",
      published_at: "2025-02-15T11:45:00Z",
      category: "CSS",
      tags: ["CSS", "Layout", "Web Design"],
      featured_image: "/api/placeholder/800/400",
      word_count: 1800,
      author: {
        name: "Sarah Jones",
        avatar: "/api/placeholder/40/40",
        role: "UI/UX Designer",
      },
      comments: Array(15),
      read_time: 15,
      popularity: 92,
    },
    {
      article_id: 4,
      title: "Understanding TypeScript Generics",
      slug: "understanding-typescript-generics",
      excerpt:
        "Master TypeScript generics to write more reusable and type-safe code in your applications with practical examples and common patterns.",
      status: "published",
      content_type: "tutorial",
      published_at: "2025-02-12T16:20:00Z",
      category: "TypeScript",
      tags: ["TypeScript", "JavaScript", "Generics"],
      featured_image: "/api/placeholder/800/400",
      word_count: 1600,
      author: {
        name: "Mike Chen",
        avatar: "/api/placeholder/40/40",
        role: "Full Stack Developer",
      },
      comments: Array(5),
      read_time: 14,
      popularity: 78,
    },
    {
      article_id: 5,
      title: "Mastering Git Workflows for Teams",
      slug: "mastering-git-workflows-for-teams",
      excerpt:
        "Learn effective Git strategies and workflows that will help your development team collaborate more efficiently with branching strategies.",
      status: "published",
      content_type: "howto",
      published_at: "2025-02-10T10:00:00Z",
      category: "DevOps",
      tags: ["Git", "Collaboration", "Version Control"],
      featured_image: null,
      word_count: 2200,
      author: {
        name: "Alex Brown",
        avatar: "/api/placeholder/40/40",
        role: "DevOps Engineer",
      },
      comments: Array(19),
      read_time: 16,
      popularity: 89,
    },
    {
      article_id: 6,
      title: "Introduction to GraphQL",
      slug: "introduction-to-graphql",
      excerpt:
        "Discover how GraphQL provides a more efficient and powerful alternative to REST APIs for data fetching with real-world implementation examples.",
      status: "published",
      content_type: "tutorial",
      published_at: "2025-02-08T14:30:00Z",
      category: "Backend",
      tags: ["GraphQL", "API", "JavaScript"],
      featured_image: "/api/placeholder/800/400",
      word_count: 1900,
      author: {
        name: "Emma Wilson",
        avatar: "/api/placeholder/40/40",
        role: "API Specialist",
      },
      comments: Array(7),
      read_time: 16,
      popularity: 76,
    },
  ];

  // Simulate API fetch
  useEffect(() => {
    const loadPosts = () => {
      setLoading(true);

      // Simulate API delay
      setTimeout(() => {
        let filteredPosts = [...mockPosts];

        // Filter by category if not 'All'
        if (selectedCategory !== "All") {
          filteredPosts = filteredPosts.filter(
            (post) => post.category === selectedCategory
          );
        }

        // Sort posts
        if (sortBy === "latest") {
          filteredPosts.sort(
            (a, b) => new Date(b.published_at) - new Date(a.published_at)
          );
        } else if (sortBy === "popular") {
          filteredPosts.sort((a, b) => b.popularity - a.popularity);
        } else if (sortBy === "comments") {
          filteredPosts.sort((a, b) => b.comments.length - a.comments.length);
        }

        // Duplicate and modify for pagination simulation
        const paginatedPosts = [
          ...filteredPosts,
          ...filteredPosts.map((post) => ({
            ...post,
            article_id: post.article_id + 100 * page,
          })),
        ].slice(0, page * 10);

        setPosts(paginatedPosts);
        setLoading(false);
      }, 800);
    };

    loadPosts();
  }, [page, selectedCategory, sortBy]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && posts.length < 50) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loading, posts.length]);

  // Available categories derived from posts
  const categories = [
    "All",
    ...Array.from(new Set(mockPosts.map((post) => post.category))),
  ];

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleCategoryChange = (category: any) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (sortMethod: any) => {
    setSortBy(sortMethod);
    setPage(1);
  };

  // Scroll to top button handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                  UL
                </div>
                <span className="ml-2 text-xl font-semibold">Uplearn</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a
                  href="#"
                  className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  Feed
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  My Courses
                </a>
                <a
                  href="#"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Bookmarks
                </a>
                <a
                  href="/articels/create"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Create Post
                </a>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>

              <div className="ml-3 relative">
                <div>
                  <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-8 w-8 rounded-full bg-gray-100 p-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with search */}
          <div className="py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Learning Feed
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Discover the latest programming tutorials and articles
                </p>
              </div>
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search courses and tutorials..."
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Filters section */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-gray-900">Browse Content</h2>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    Filters
                    <ChevronDown
                      className={`h-4 w-4 ml-1 transition-transform ${
                        showFilters ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 md:mt-0 flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                    >
                      <option value="latest">Latest</option>
                      <option value="popular">Popular</option>
                      <option value="comments">Most Discussed</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Expanded filters */}
              {showFilters && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => handleCategoryChange(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedCategory === category
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(mockPosts.map((post) => post.content_type))
                        ).map((type) => (
                          <button
                            key={type}
                            className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Reading Time
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                          &lt; 10 min
                        </button>
                        <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                          10-20 min
                        </button>
                        <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                          &gt; 20 min
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Featured post */}
            {selectedCategory === "All" && page === 1 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 md:w-1/3">
                    <img
                      src="/api/placeholder/800/600"
                      alt="Featured post"
                      className="h-48 md:h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:p-8 md:w-2/3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-white bg-blue-600">
                        Featured
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-white bg-purple-600">
                        Tutorial
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Complete Guide to Modern Frontend Development
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Master the essential tools and frameworks for modern
                      frontend development, including React, TypeScript, and
                      Tailwind CSS with this comprehensive guide.
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src="/api/placeholder/40/40"
                        alt="Author"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Robert Johnson
                        </p>
                        <p className="text-xs text-gray-500">
                          Lead Frontend Developer
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>25 min read</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Trending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>32 comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <article
                  key={post.article_id}
                  className="flex flex-col rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition duration-300"
                >
                  {post.featured_image && (
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                            post.content_type === "tutorial"
                              ? "bg-blue-600"
                              : post.content_type === "howto"
                              ? "bg-green-600"
                              : post.content_type === "explainer"
                              ? "bg-purple-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {post.content_type.charAt(0).toUpperCase() +
                            post.content_type.slice(1)}
                        </span>
                      </div>
                      <button className="absolute top-2 left-2 bg-white/80 rounded-full p-1.5 hover:bg-white transition-colors">
                        <Bookmark className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  )}

                  <div className="flex-1 p-5">
                    {!post.featured_image && (
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full text-white ${
                            post.content_type === "tutorial"
                              ? "bg-blue-600"
                              : post.content_type === "howto"
                              ? "bg-green-600"
                              : post.content_type === "explainer"
                              ? "bg-purple-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {post.content_type.charAt(0).toUpperCase() +
                            post.content_type.slice(1)}
                        </span>
                        <button className="bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition-colors">
                          <Bookmark className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {post.author.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.author.role}
                        </p>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                      <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.read_time} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        {formatDate(post.published_at)}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Loading more posts...</p>
              </div>
            )}

            {/* Scroll sentinel for infinite loading */}
            <div id="scroll-sentinel" className="h-4 mt-8"></div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {posts.length > 10 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Feed;
