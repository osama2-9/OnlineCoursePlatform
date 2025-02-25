import express from "express";
import {
  createArtical,
  createCategory,
  getArticalById,
  getArticles,
  getCategories,
} from "../controllers/articalsController.js";
import { checkRole } from "../middlewares/checkRole.js";
const articleRoute = express.Router();

articleRoute.post(
  "/create-articel",
  checkRole(["admin", "instructor"]),
  createArtical
);
articleRoute.post("/create-category", checkRole(["admin"]), createCategory);
articleRoute.get("/get-categories", getCategories);
articleRoute.get("/get-article/:articalId", getArticalById);
articleRoute.get("/get-articles", getArticles);

export default articleRoute;
