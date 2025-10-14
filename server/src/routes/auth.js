// const express = require("express");
// const {
//   verifyEmail,
//   sendOtp,
//   login,
//   register,
//   logout,
//   forgotPassword,
//   verifyOtp,
//   resetPassword,
//   promoteToAdmin,
//   refreshToken,
// } = require("../controllers/authController");

// const userMiddleware = require("../middleware/userMiddleware");
// const passport = require("passport");
// const adminMiddleware = require("../middleware/adminMiddleware");
// const superAdminMiddleware = require("../middleware/superAdminMiddleware");
// const jwt = require("jsonwebtoken");
// const authRouter = express.Router();

// authRouter.post("/send-otp", sendOtp);
// authRouter.post("/verify-email", verifyEmail);
// authRouter.post("/signup", register);
// authRouter.post("/login", login);
// authRouter.post("/logout", userMiddleware, logout);

// //refresh token call it generates the the new access token
// authRouter.post("/refresh-token", refreshToken);

// //protected route of user
// authRouter.post("/forgot-password", forgotPassword);
// authRouter.post("/verify-otp", verifyOtp);
// authRouter.post("/reset-password", resetPassword);

// //admin route
// authRouter.post("/admin", superAdminMiddleware, promoteToAdmin);

// // Temporary route to create admin user for testing
// authRouter.post("/create-admin", async (req, res) => {
//   try {
//     const { firstName, email, password } = req.body;

//     if (!firstName || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const bcrypt = require("bcrypt");
//     const User = require("../models/user");

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const adminUser = await User.create({
//       firstName,
//       email,
//       password: hashedPassword,
//       role: "admin",
//       isVerified: true,
//     });

//     res.status(201).json({
//       message: "Admin user created successfully",
//       user: {
//         firstName: adminUser.firstName,
//         email: adminUser.email,
//         role: adminUser.role,
//       },
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error creating admin user", error: err.message });
//   }
// });

// //google auth
// authRouter.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );


// authRouter.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   async (req, res) => {
//     try {
//       const user = req.user; // This user is already processed in passport.js

//       const token = jwt.sign(
//         { _id: user._id, email: user.email, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: 60 * 60 } // 1 hour
//       );

//       const userData = {
//         _id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         role: user.role,
//       };

//       const userDataStr = encodeURIComponent(JSON.stringify(userData));
//       res.redirect(
//         `${process.env.CLIENT_URL}/auth/google/callback?token=${token}&userData=${userDataStr}`
//       );
//     } catch (error) {
//       console.error("Google login error:", error);
//       res.redirect("/login");
//     }
//   }
// );

// module.exports = authRouter;

const express = require("express");
const {
  verifyEmail,
  sendOtp,
  login,
  register,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
  promoteToAdmin,
  refreshToken,
} = require("../controllers/authController");

const userMiddleware = require("../middleware/userMiddleware");
const passport = require("passport");
const adminMiddleware = require("../middleware/adminMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();

authRouter.post("/send-otp", sendOtp);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/signup", register);
authRouter.post("/login", login);
authRouter.post("/logout", userMiddleware, logout);

//refresh token call it generates the the new access token
authRouter.post("/refresh-token", refreshToken);

//protected route of user
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

//admin route
authRouter.post("/admin", superAdminMiddleware, promoteToAdmin);

// Temporary route to create admin user for testing
authRouter.post("/create-admin", async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const bcrypt = require("bcrypt");
    const User = require("../models/user");

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await User.create({
      firstName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "Admin user created successfully",
      user: {
        firstName: adminUser.firstName,
        email: adminUser.email,
        role: adminUser.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating admin user", error: err.message });
  }
});

// Google OAuth initiation
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// FIXED Google OAuth callback with proper error handling
authRouter.get("/google/callback", (req, res, next) => {
  console.log("Google callback route hit");
  console.log("Query params:", req.query);
  
  passport.authenticate("google", (err, user, info) => {
    console.log("Passport authenticate callback:");
    console.log("Error:", err);
    console.log("User:", user ? user.email : 'No user');
    console.log("Info:", info);

    if (err) {
      console.error("OAuth authentication error:", err);
      const clientUrl = process.env.CLIENT_URL.split(',')[0] || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/login?error=oauth_error&message=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      console.error("No user returned from OAuth");
      const clientUrl = process.env.CLIENT_URL.split(',')[0] || 'http://localhost:5173';
      return res.redirect(`${clientUrl}/login?error=no_user`);
    }

    try {
      console.log("Creating JWT token for user:", user.email);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          _id: user._id, 
          email: user.email, 
          role: user.role,
          firstName: user.firstName 
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Changed to 7 days for better UX
      );

      const userData = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified
      };

      console.log("Token created successfully, redirecting...");
      
      // Get the first client URL (remove any trailing commas/spaces)
      const clientUrl = process.env.CLIENT_URL.split(',')[0].trim();
      const userDataStr = encodeURIComponent(JSON.stringify(userData));
      
      const redirectUrl = `${clientUrl}/auth/google/callback?token=${token}&userData=${userDataStr}`;
      console.log("Redirect URL:", redirectUrl);
      
      res.redirect(redirectUrl);
      
    } catch (tokenError) {
      console.error("Token generation error:", tokenError);
      const clientUrl = process.env.CLIENT_URL.split(',')[0] || 'http://localhost:5173';
      res.redirect(`${clientUrl}/login?error=token_error&message=${encodeURIComponent(tokenError.message)}`);
    }
  })(req, res, next);
});

// Debug route to test OAuth setup
authRouter.get("/debug", (req, res) => {
  res.json({
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
      CLIENT_URL: process.env.CLIENT_URL,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
    },
    session: req.session,
    user: req.user,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

authRouter.get("/user/profile", userMiddleware, async (req, res) => {
  const UserId =  req.user._id;

  try {
  //  const user = await User.findById(UserId)
   console.log(req.user);
   res.send(req.user);

  //  res.send(user);
  }
  catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }

})

module.exports = authRouter;

