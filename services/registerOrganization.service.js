import Organization from "../models/organization.model.js";
import { BadRequestError } from "../utils/errors.js";

const RegisterOrgService = async ({ name, email, password, otp }) => {
  if (
    (!name || name == null || name == undefined) &&
    (!email || email == null || email == undefined) &&
    (!password || password == null || password == undefined)
  ) {
    throw new BadRequestError();
  }
  const hashedPassword = await Organization.hashPassword(password);
  const org = await Organization.create({
    name,
    email,
    password: hashedPassword,
    otp,
    otpExpiry: Date.now() + Number(process.env.OTP_EXPIRY_MS),
  });
  return org;
};

export default RegisterOrgService;
