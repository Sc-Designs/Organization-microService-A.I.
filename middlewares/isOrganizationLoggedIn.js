import jwt from "jsonwebtoken";
import OrgFinder from "../utils/OrgFinder.js";
import redisClient from "../services/redis.service.js";

const logerAuthenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.OrganizationToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized token" });
    }

    const isBlackList = await redisClient.get(token);
    if (isBlackList) {
      return res.status(401).json({ error: "token is black Listed" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const organization = await OrgFinder({
      key: "_id",
      query: decoded.id,
      lean: true,
    });
    if (!organization) {
      return res.status(404).json({ error: "organization not found" });
    }
    req.organization = organization;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default logerAuthenticate;
