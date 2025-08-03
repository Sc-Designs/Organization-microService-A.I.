import axios from "axios";

const isAdminLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies?.AdminToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const response = await axios.get(`${process.env.ADMIN_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data || !response.data.admin) {
      return res.status(403).json({ error: "Access denied" });
    }
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
export default isAdminLoggedIn;
