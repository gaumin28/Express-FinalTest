import TeacherPositionModel from "../Models/teacherPositionModel.js";

export const createTeacherPosition = async (req, res) => {
  try {
    const { name, code, des, isActive } = req.body;
    const newTeacherPosition = await TeacherPositionModel.create({
      name,
      code,
      des,
      isActive,
    });
    return res.status(201).json({
      message: "success",
      data: newTeacherPosition,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTeacherPosition = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // If no pagination params, return all (used by Teacher form dropdown)
    if (!page && !limit) {
      const teacherPositions = await TeacherPositionModel.find({
        isDeleted: false,
      }).sort({ _id: -1 });
      return res.status(200).json({
        message: "success",
        data: teacherPositions,
      });
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [teacherPositions, totalItems] = await Promise.all([
      TeacherPositionModel.find({ isDeleted: false })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limitNumber),
      TeacherPositionModel.countDocuments({ isDeleted: false }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limitNumber));

    return res.status(200).json({
      message: "success",
      data: teacherPositions,
      pageNumber,
      limitNumber,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
