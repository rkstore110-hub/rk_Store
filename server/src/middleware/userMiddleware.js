const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");

const userMiddleware = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Token missing. Please log in again." });
    }

    const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
    const { _id } = payload;

    if (!_id) return res.status(401).json({ message: "Invalid token payload" });

    const user = await User.findById(_id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const isBlocked = await redisClient.exists(`token:${accessToken}`);
    if (isBlocked) return res.status(401).json({ message: "Token is blocked" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};


module.exports = userMiddleware;
