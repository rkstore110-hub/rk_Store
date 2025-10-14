// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user");

// // Serialize user
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// // Deserialize user
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Updated Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value;

//         // Check by email first
//         let user = await User.findOne({ email });

//         if (user) {
//           // If user exists and doesn't have a googleId, add it
//           if (!user.googleId) {
//             user.googleId = profile.id;
//             await user.save();
//           }
//           return done(null, user);
//         }

//         // No user found — create new one
//         const newUser = await User.create({
//           googleId: profile.id,
//           firstName: profile.displayName,
//           email,
//           isVerified: true,
//           role: "user", // optional default
//         });

//         return done(null, newUser);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// module.exports = passport;

// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user");

// // Serialize user
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// // Deserialize user
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Updated Google Strategy - FIX: Use absolute URL for callbackURL
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `http://localhost:${process.env.PORT_NO || 3000}/auth/google/callback`, // FIXED: Absolute URL
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log('Google OAuth Profile:', profile.emails[0].value); // Debug log
        
//         const email = profile.emails[0].value;

//         // Check by email first
//         let user = await User.findOne({ email });

//         if (user) {
//           // If user exists and doesn't have a googleId, add it
//           if (!user.googleId) {
//             user.googleId = profile.id;
//             await user.save();
//           }
//           console.log('Existing user found and updated:', user.email);
//           return done(null, user);
//         }

//         // No user found — create new one
//         const newUser = await User.create({
//           googleId: profile.id,
//           firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
//           lastName: profile.name?.familyName || profile.displayName.split(' ')[1] || '',
//           email,
//           isVerified: true,
//           role: "user",
//         });

//         console.log('New user created:', newUser.email);
//         return done(null, newUser);
//       } catch (error) {
//         console.error('Google OAuth Error:', error);
//         return done(error, null);
//       }
//     }
//   )
// );

// module.exports = passport;

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT_NO || 3000}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google OAuth Profile received for:', profile.emails[0].value);
        
        const email = profile.emails[0].value;

        // Check by email first
        let user = await User.findOne({ email });

        if (user) {
          // If user exists and doesn't have a googleId, add it
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          console.log('Existing user found and updated:', user.email);
          return done(null, user);
        }

        // Extract name information
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Unknown';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          firstName,
          lastName,
          email,
          isVerified: true,
          role: "user",
        });

        console.log('New user created:', newUser.email);
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth Strategy Error:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

