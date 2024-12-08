import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './../models/user.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const router = express.Router();

//Imporing the authvalidation functions for login and register
import {
  registerValidation,
  loginValidation,
} from './../middleware/authValidation.middleware.js';
import {  
  login,
  register,
  userProfile,
  users,
  editUser,
} from './../controllers/auth.controller.js';

//Importing the JWT verifyer from auth middleware
import verifyToken from './../middleware/auth.middleware.js';

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', verifyToken, userProfile);
router.put('/edit-user', verifyToken, editUser);

router.get('/users', users);

// Social Login ( Google )
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in the database
        let user = await User.findOne({ provider_id: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = new User({
            provider_id: profile?.id,
            email: profile?.emails[0]?.value,
            name: profile?.displayName,
            avatar: profile?._json?.picture,
            provider: profile?.provider,
          });
          await user.save();
        }

        done(null, { user });
      } catch (error) {
        done(error, false);
      }
    },
  ),
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

// Route to initiate Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// Route to handle Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const googleUser = req.user;

      // Check if the user exists in the database
      const social_user = await User.findOne({
        provider_id: googleUser.user.provider_id,
      });

      if (!social_user) {
        return res.status(401).json({ message: 'Authentication Failed' });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        {
          provider_id: social_user.provider_id,
          email: social_user.email,
          role: social_user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '4h',
        },
      );

      res.cookie('token', jwtToken, {
        maxAge: 4 * 60 * 60 * 1000,
      });

      res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },
);

// Logout route
router.get('/google/logout', (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL);
  });
});

export default router;
