import express from "express";
import {
  addBookmark,
  addComment,
  addLike,
  createArtical,
  createCategory,
  
  getArticalById,
  getArticles,
  getBookMarkedArticles,
  getCategories,
  removeBookmark,
  removeLike,
} from "../controllers/articalsController.js";
import { checkRole } from "../middlewares/checkRole.js";
import { protectedRoute } from "../middlewares/protectedRoute.js";
const articleRoute = express.Router();

articleRoute.post(
  "/create-articel",
  checkRole(["admin", "instructor"]),
  createArtical
);
articleRoute.post("/create-category", checkRole(["admin"]), createCategory);
articleRoute.get("/get-categories", getCategories);
articleRoute.get("/get-article/:articalId/u/:userId", getArticalById);
articleRoute.get("/get-articles", getArticles);
articleRoute.post("/comment", protectedRoute, addComment);
articleRoute.post("/like", protectedRoute, addLike);
articleRoute.delete("/remove-like/:articleId/:userId", protectedRoute, removeLike);
articleRoute.post("/add-bookmark", protectedRoute, addBookmark);
articleRoute.delete("/remove-bookmark/:articleId/:userId", protectedRoute, removeBookmark);
articleRoute.get("/get-bookmarks/user/:userId", protectedRoute, getBookMarkedArticles);

export default articleRoute;
