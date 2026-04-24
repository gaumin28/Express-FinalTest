import UserModel from "../Models/userModel.js";

export const createUser = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, address, identity, dob, role } = req.body;

    const newUser = await UserModel.create({
      name,
      email,
      phoneNumber,
      address,
      identity,
      dob,
      role,
    });

    req.newUser = newUser;
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
