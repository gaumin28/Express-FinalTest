export const validateCreateTeacher = async (req, res, next) => {
  try {
    const {
      isActive,
      startDate,
      teacherPosition,
      teacherPositions,
      degreeType,
      school,
      major,
      year,
      isGraduated,
    } = req.body;

    const hasTeacherPosition = Array.isArray(teacherPositions)
      ? teacherPositions.length > 0
      : Boolean(teacherPosition || teacherPositions);

    if (
      typeof isActive !== "boolean" ||
      !startDate ||
      !hasTeacherPosition ||
      !degreeType ||
      !school ||
      !major ||
      !year ||
      !isGraduated
    )
      throw new Error("Missing required information");
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
