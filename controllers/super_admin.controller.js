import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import SuperAdmin from './../models/superadmin.js';
import Lessor from '../models/lessor.js';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';

const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phone_number, avatar } =
    req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Verify if the email is already used
    const existingSuperAdmin = await SuperAdmin.findOne({ email });
    if (existingSuperAdmin) {
      return res.status(403).json({ message: 'Email already used' });
    }

    // Generate admin id
    const superAdminId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the super admin
    const moderator = new SuperAdmin({
      superAdminId,
      name,
      email,
      password: hashedPassword,
      phone_number,
      avatar,
    });

    // Save the super admin to the database
    const savedAdmin = await moderator.save();
    return res.status(201).json({
      message: 'Super Admin successfully Registered!',
      success: true,
      moderator: savedAdmin,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Login user
const loginSuperAdmin = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Verify if the user with the email or phone number exists
    const moderator = await SuperAdmin.findOne({
      $or: [{ email: emailOrPhone }, { phone_number: emailOrPhone }],
    });

    if (!moderator) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, moderator.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        email: moderator.email, // Checking email
        role: moderator.role, // Checking role to making a admin or user route
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '4h',
      },
    );

    return res.status(200).json({
      message: 'Login successfully',
      moderator,
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
const superAdminProfile = asyncHandler(async (req, res) => {
  try {
    const superAdminEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({
      email: superAdminEmail,
    }).select('-password'); //get password out

    if (!moderator) {
      return res.status(404).json({
        success: false,
        message: 'Super admin  not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login Successfully',
      moderator ,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export { registerSuperAdmin, loginSuperAdmin, superAdminProfile };
