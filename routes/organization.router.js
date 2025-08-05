import express from "express";
import { body } from "express-validator";
import tryCatch from "../utils/tryCatch.js";
import {
  login,
  register,
  verifyOtp,
  SearchOrganizations,
  analytics,
  GetProfile,
} from "../controllers/organization.controller.js";
import isAdminLoggedIn from "../middlewares/isAdminLoggedIn.js";
import isOrganizationLoggedIn from "../middlewares/isOrganizationLoggedIn.js";
const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .notEmpty()
      .isString()
      .isLength({ min: 1, max: 30 })
      .withMessage("Name must be in 1 to 30 Charecters"),
    body("email").notEmpty().isEmail().withMessage("email not verified"),
    body("password")
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage("Password must be 8 Charecter long"),
  ],
  tryCatch(register)
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email is not varified."),
    body("password")
      .isLength({ min: 8 })
      .withMessage("password or email wrong!"),
  ],
  tryCatch(login)
);

router.post(
  "/verify-otp",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("otp must be 6 charecters"),
    body("email")
      .isEmail()
      .withMessage("Something went wrong Please try again!"),
  ],
  tryCatch(verifyOtp)
);
router.get("/profile", isOrganizationLoggedIn, tryCatch(GetProfile));
router.get("/analytics", isAdminLoggedIn, tryCatch(analytics));
router.get("/search", isAdminLoggedIn, tryCatch(SearchOrganizations));
export default router;
