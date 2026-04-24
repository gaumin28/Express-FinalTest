import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import TeacherModel from "./Models/teacherModel.js";
import TeacherPositionModel from "./Models/teacherPositionModel.js";
import { TeacherRouter } from "./Routes.js/teacherRouter.js";
import { TeacherPositionRouter } from "./Routes.js/teacherPositionRouter.js";

mongoose
  .connect(
    "mongodb+srv://gaumin28:gaumin28@cluster0.b4ttglb.mongodb.net/?appName=Cluster0",
  )
  .then(() => {
    console.log("Connect to db successfully");
  });

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("", (req, res) => {
  return res.send("Hello");
});

app.use("/teachers", TeacherRouter);

app.use("/teacher-positions", TeacherPositionRouter);

app.listen(8008, () => {
  console.log("Server is running on port 8080");
});
