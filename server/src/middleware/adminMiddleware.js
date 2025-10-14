const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies); // Debug all cookies
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("admin token" , token)
    
    if (!token) {
      return res.status(401).json({ message: "Token missing. Please log in again." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, role } = payload;

    if (!_id || (role !== "admin" && role !== "superadmin"))
      return res.status(403).json({ message: "Access restricted to admins" });

    const admin = await User.findById(_id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) return res.status(401).json({ message: "Token is blocked" });

    req.user = admin;
    next();

  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = adminMiddleware;
