import TeacherPositionModel from "../Models/teacherPositionModel.js";

export const validateCreateTeacherPosition = async (req, res, next) => {
  try {
    const { name, code, des, isActive } = req.body;
    if (!name || !code || !des || typeof isActive !== "boolean")
      throw new Error("Missing required information");
    const existedCodePosition = await TeacherPositionModel.findOne({ code });
    if (existedCodePosition) throw new Error("This code existed");
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
