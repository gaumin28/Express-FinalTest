import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
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
  code: {
    type: String,
    unique: true,
    required: true,
    match: /^\d{10}$/,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  teacherPositions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacherPositions",
      required: true,
    },
  ],
  degrees: [
    {
      degreeType: {
        type: String,
        required: true,
      },
      school: {
        type: String,
        required: true,
      },
      major: {
        type: String,
        required: true,
      },
      year: {
        type: Number,
        required: true,
      },
      isGraduated: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

const TeacherModel = mongoose.model("teachers", teacherSchema);

export default TeacherModel;
