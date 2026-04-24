import UserModel from "../Models/userModel.js";

export const validateCreateUser = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, address, identity, dob, role } = req.body;
    if (
      !name ||
      !email ||
      !phoneNumber ||
      !address ||
      !identity ||
      !dob ||
      !role
    )
      throw new Error("Missing required information");
    const existedEmailUser = await UserModel.findOne({ email });
    if (existedEmailUser) throw new Error("User existed");
    const existedPhoneNumberUser = await UserModel.findOne({ phoneNumber });
    if (existedPhoneNumberUser) throw new Error("User existed");
    const existedIdentityUser = await UserModel.findOne({ identity });
    if (existedIdentityUser) throw new Error("User existed");
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
