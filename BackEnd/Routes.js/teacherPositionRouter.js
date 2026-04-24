import { Router } from "express";
import { validateCreateTeacherPosition } from "../Middlewares/teacherPositionMiddleware.js";
import {
  createTeacherPosition,
  getTeacherPosition,
} from "../Controllers/teacherPositionController.js";

export const TeacherPositionRouter = Router();

TeacherPositionRouter.post(
  "",
  validateCreateTeacherPosition,
  createTeacherPosition,
);
TeacherPositionRouter.get("", getTeacherPosition);
