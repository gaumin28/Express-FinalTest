import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  identity: {
    type: String,
    unique: true,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["STUDENT", "TEACHER", "ADMIN"],
  },
});

const UserModel = mongoose.model("users", userSchema);
export default UserModel;
