import OrgFinder from '../utils/OrgFinder.js';
import createOtp from "../utils/otpMaker.js";
import sendEmail from "../utils/EmailSender.js";
import { validationResult } from "express-validator";
import crypto from "crypto";
import RegisterOrgService from '../services/registerOrganization.service.js';

const register = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const ExistingOrg = await OrgFinder({
      key: "email",
      query: email.toLowerCase().trim(),
      lean: true,
    });
    if (ExistingOrg) {
      return res
        .status(406)
        .json({ message: "Organization already Exist, please Login." });
    }
    const otp = createOtp(6);
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const newOrganization = await RegisterOrgService({
      name,
      email,
      password,
      otp: hashedOtp,
    });
    res.status(201).json("Okk");
    await sendEmail({
      email,
      sub: "OTP Recive",
      mess: `Organization OTP is ${otp}`,
    });
}
const login = async (req,res)=>{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const Org = await OrgFinder({
        key: "email",
        query: email.toLowerCase().trim(),
        includePassword: true,
      });
      if (!Org)
        return res
          .status(404)
          .json({ message: "email or password something wrong!" });
      const isMatch = await Org.comparePassword(password);
      if (!isMatch)
        return res.status(404).json("email or password something wrong!");
      const otp = createOtp(6);
      const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
      Org.otp = hashedOtp;
      Org.otpExpiry = Date.now() + +process.env.OTP_EXPIRY_MS;
      await Org.save();
      res.status(200).json("Valid");
      await sendEmail({
        email,
        sub: "OTP Recive",
        mess: `Organization OTP is ${otp}`,
      });
}

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const Org = await OrgFinder({
    key: "email",
    query: email.toLowerCase().trim(),
  });
  if (!Org)
    return res
      .status(404)
      .json({ message: "email or password something wrong!" });
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  if (!Org || Org.otp !== hashedOtp || Org.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  Org.otp = null;
  Org.otpExpiry = null;
  await Org.save();
  const token = Org.generateToken();
  res.json({
    message: "OTP verified successfully",
    token,
    Org,
  });
};

export { login, register, verifyOtp };