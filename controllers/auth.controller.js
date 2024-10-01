import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import SocialUser from './../models/social_user.js';
import User from './../models/user.js';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';

// Register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phone_number } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Verify if the email is already used
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).json({ message: 'Email already used' });
    }

    // Generate userId
    const userId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the user
    const user = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      phone_number,
    });

    // Save the user to the database
    const savedUser = await user.save();
    return res.status(201).json({
      message: 'User successfully Registered!',
      success: true,
      user: savedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Verify if the user with the email or phone number exists
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone_number: emailOrPhone }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        email: user.email, // Checking email
        role: user.role, // Checking role to making a admin or user route
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '4h',
      },
    );

    return res.status(200).json({
      message: 'Login successfully',
      user,
      accessToken: jwtToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Login failed, please try again !',
      success: false,
    });
  }
});

// User profile
const userProfile = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const providerId = req.userData.provider_id;

    // Fetch default and social users based on the email and provider_id
    const defaultUser = await User.findOne({ email: userEmail }).select(
      '-password',
    );

    // find a social user
    const socialUser = await SocialUser.findOne({
      provider_id: providerId,
    });

    // If neither the defaultUser nor the socialUser exist, return 404
    if (!defaultUser && !socialUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Handle cases where both users exist and have the same email
    if (defaultUser && socialUser) {
      return res.status(200).json({
        success: true,
        message: 'Both users exist with the same email',
        defaultUser,
        socialUser,
      });
    }

    // Handle case where only the default user exists
    if (defaultUser && !socialUser) {
      return res.status(200).json({
        success: true,
        message: 'Default user exists but no social user found',
        user: defaultUser,
      });
    }

    // Handle case where only the social user exists
    if (!defaultUser && socialUser) {
      return res.status(200).json({
        success: true,
        message: 'Social user exists but no default user found',
        user: socialUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Fetch all users
const users = asyncHandler(async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    return res.status(200).json({
      success: true,
      message: 'Users list',
      data: users,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

export { register, login, userProfile, users };
