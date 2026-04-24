import mongoose from "mongoose";

const teacherPositionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  des: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const TeacherPositionModel = mongoose.model(
  "teacherPositions",
  teacherPositionSchema,
);

export default TeacherPositionModel;
