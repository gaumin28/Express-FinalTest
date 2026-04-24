import { Router } from "express";
import { validateCreateUser } from "../Middlewares/userMiddleware.js";
import { validateCreateTeacher } from "../Middlewares/teacherMiddleware.js";
import { createUser } from "../Controllers/userController.js";
import {
  createTeacher,
  getTeachers,
} from "../Controllers/teacherController.js";

export const TeacherRouter = Router();

TeacherRouter.post(
  "",
  validateCreateUser,
  createUser,
  validateCreateTeacher,
  createTeacher,
);

TeacherRouter.get("", getTeachers);
