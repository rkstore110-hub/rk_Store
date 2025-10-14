const jwt = require("jsonwebtoken");
const User = require("../models/user");

const superAdminMiddleware = async (req, res, next) => {
  try {
    // FIX: Use req.cookies.token instead of undefined 'accessToken'
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Token missing" });

    // FIX: Verify the actual token variable
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload._id);

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Only super admin can perform this action" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

module.exports = superAdminMiddleware; 