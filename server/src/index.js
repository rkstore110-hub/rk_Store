
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./config/passport");

// ✅ DB & Config Imports
const database = require("./config/database");
const redisClient = require("./config/redis"); 

// ✅ Route Imports (Cashfree ko Razorpay se replace kiya)
const authRouter = require("./routes/auth");
const AdminRouter = require("./routes/AdminRoutes");
const dataRouter = require("./routes/getDataRoutes"); 
const orderRouter = require("./routes/orderRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const cartRouter = require("./routes/cartRoutes");
const numberVerifyrouter = require("./routes/NumberVerifyRoutes");
const ShipRocketrouter = require("./routes/ShiprocketRoutes")
// FIX: File aur Variable name dono ko Razorpay kiya
const RazorpayRouter = require("./routes/RazorpayRoutes"); 
const hamperRouter = require("./routes/CreateHamperRoutes")

// ✅ ADD THESE MODEL IMPORTS TO REGISTER THEM WITH MONGOOSE (GOOD PRACTICE)
require("./models/AddPost");     // Products
require("./models/Cart");        
require("./models/Order");       
require("./models/Wishlist");    
require("./models/user");        
require("./models/Notification"); 
require("./models/hamperModel"); 

const PORT_NO = process.env.PORT_NO || 3000;

app.use(express.json()); // Body parser for JSON
app.use(cookieParser());

// Security middleware
app.use(helmet()); 

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : [];
app.use(cors({
  origin: allowedOrigins,  // Environment variable se allowed origins
  credentials: true,
  optionsSuccessStatus: 200
}));

// Session and Passport setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "a_default_secret_key", // Apne secret key se replace karein
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: process.env.NODE_ENV === "production" ? true : false, 
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }, 
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/admin", AdminRouter);
app.use("/api", dataRouter);
app.use("/orders", orderRouter);
app.use("/wishlist", wishlistRouter);
app.use("/cart", cartRouter);
app.use("/notifications", notificationRouter);
app.use("/shiprocket",ShipRocketrouter);
app.use("/api/verify",numberVerifyrouter);
app.use("/hamper",hamperRouter);
 
// FIX: Razorpay logic ko '/razorpay' prefix par mount kiya
app.use("/razorpay", RazorpayRouter); 

// Basic welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Server is Running smoothly! 🚀",
        env: process.env.NODE_ENV || "development"
    });
});



const initialConnection = async () => {
  try {
    await Promise.all([redisClient.connect(), database()]);
    console.log("Databases (MongoDB & Redis) Connected successfully! 🔗");

    app.listen(PORT_NO, () => {
      console.log(`Server is Listening on port no ${PORT_NO}`);
    });
  } catch (err) {
    console.error("❌ Fatal Error during Initialization: " + err);
  }
};

initialConnection();

// --------------------------------------------------------------------------