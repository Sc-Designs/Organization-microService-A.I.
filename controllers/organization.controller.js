import OrgFinder from '../utils/OrgFinder.js';
import createOtp from "../utils/otpMaker.js";
import sendEmail from "../utils/EmailSender.js";
import { validationResult } from "express-validator";
import crypto from "crypto";
import RegisterOrgService from '../services/registerOrganization.service.js';
import Organization from "../models/organization.model.js";
import getGroupStage from '../utils/GetGroupStage.js';
import fillterOrgData from '../utils/FillterOrgData.js';

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
    Org: fillterOrgData(Org),
  });
};

const SearchOrganizations = async (req, res) => {
  const { query = "", page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;


  try {
    const orgs = await Organization.find({
      $or: [
        { name: { $regex: `^${query}`, $options: "i" } },
        { email: { $regex: `^${query}`, $options: "i" } },
      ],
    })
      .select("name email number block")
      .lean()
      .skip(skip)
      .limit(limit + 1);

    const hasMore = orgs.length > limit;
    if (hasMore) orgs.pop();

    res.json({ orgs, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const analytics = async (req, res) => {
  const filter = req.query.filter?.toLowerCase() || "weekly";
  const groupBy = getGroupStage(filter);

  try {
    const result = await Organization.aggregate([
      { $match: { createdAt: { $exists: true } } },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Organization analytics error", error: err.message });
  }
};

const GetProfile = async (req, res) => {
  const orgId = req.organization._id;
  try {
    const organizationUser = await OrgFinder({
      key: "_id", 
      query: orgId,
      lean: true,
    });

    if (!organizationUser) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.json({ Org: fillterOrgData(organizationUser, true) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
export {
  login,
  register,
  verifyOtp,
  SearchOrganizations,
  analytics,
  GetProfile,
};