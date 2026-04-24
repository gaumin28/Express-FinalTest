import TeacherModel from "../Models/teacherModel.js";

const generateRandom10DigitCode = () => {
  const min = 1000000000;
  const max = 9999999999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const generateUniqueTeacherCode = async () => {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const code = generateRandom10DigitCode();
    const existingTeacher = await TeacherModel.findOne({ code });

    if (!existingTeacher) {
      return code;
    }
  }

  throw new Error("Could not generate a unique teacher code.");
};

export const createTeacher = async (req, res) => {
  try {
    const {
      isActive,
      startDate,
      endDate,
      teacherPosition,
      teacherPositions,
      degreeType,
      school,
      major,
      year,
      isGraduated,
    } = req.body;

    const teacherCode = await generateUniqueTeacherCode();
    const newUser = req.newUser;

    if (!newUser) {
      throw new Error("User creation failed before teacher creation.");
    }

    const newTeacher = await TeacherModel.create({
      userId: newUser._id,
      isActive,
      code: teacherCode,
      startDate,
      endDate,
      teacherPositions: teacherPosition || teacherPositions,
      degrees: [
        {
          degreeType,
          school,
          major,
          year,
          isGraduated,
        },
      ],
    });
    return res.status(201).json({
      message: "success",
      data: newTeacher,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.max(1, Number(limit) || 20);
    const skip = (pageNumber - 1) * limitNumber;

    const baseMatch = { isDeleted: false };

    const [teachers, countResult] = await Promise.all([
      TeacherModel.aggregate([
        { $match: baseMatch },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        { $match: { "userId.isDeleted": false } },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: limitNumber },
      ]),
      TeacherModel.aggregate([
        { $match: baseMatch },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $unwind: "$userId" },
        { $match: { "userId.isDeleted": false } },
        { $count: "totalItems" },
      ]),
    ]);

    const totalItems = countResult[0]?.totalItems || 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / limitNumber));

    return res.status(200).json({
      message: "Success",
      data: teachers,
      pageNumber,
      limitNumber,
      totalItems,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
