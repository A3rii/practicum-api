import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Lessor from './../models/lessor.js';
import { v4 as uuidv4 } from 'uuid';

const registerLessor = asyncHandler(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirmPassword,
    phone_number,
    address,
    sportcenter_name,
    sportcenter_description,
    facilities,
    operating_hours,
  } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Verify if the email is already used
    const existingLessor = await Lessor.findOne({ email });
    if (existingLessor) {
      return res.status(403).json({ message: 'Email already used' });
    }

    // Verify if the phone number is already used
    const existingPhoneNumber = await Lessor.findOne({ phone_number });
    if (existingPhoneNumber) {
      return res.status(403).json({ message: 'Phone number already used' });
    }

    // Generate userId (if needed)
    const userId = uuidv4();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the lessor
    const lessor = new Lessor({
      userId,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      address,
      sportcenter_name,
      sportcenter_description,
      facilities,
      operating_hours,
    });

    // Save the lessor to the database
    const savedLessor = await lessor.save();

    // Generate JWT token
    const jwtToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });

    return res.status(201).json({
      message: 'Lessor successfully registered!',
      success: true,
      lessor: savedLessor,
      accessToken: jwtToken,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const loginLessor = asyncHandler(async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    // Verify if the lessor with the email or phone number exists
    const lessor = await Lessor.findOne({
      $or: [{ email: emailOrPhone }, { phone_number: emailOrPhone }],
    });

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, lessor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        email: lessor.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h',
      },
    );

    return res.status(200).json({
      message: 'Login successfully',
      lessor,
      accessToken: jwtToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

const lessorProfile = asyncHandler(async (req, res) => {
  try {
    const lessorEmail = req.userData.email; // Get user ID from the decoded token
    const lessor = await Lessor.findOne({ email: lessorEmail }).select(
      '-password',
    ); // Get password out
    if (!lessor) {
      return res.status(404).json({
        success: false,
        message: 'Lessor not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lessor Found',
      lessor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const getAllLessors = asyncHandler(async (req, res) => {
  try {
    // Fetch all lessors from the database
    const lessors = await Lessor.find();
    return res.status(200).json({
      success: true,
      message: 'Lessors list',
      lessors,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

const getLessorsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const lessor = await Lessor.findById(id);
    return res.status(200).json({
      success: true,
      message: 'Lessor',
      lessor: lessor,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// Edit lessor information
const editLessor = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({
        message: 'Lessor not found',
      });
    }

    const updatedLessor = await Lessor.findByIdAndUpdate(lessor._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedLessor) {
      return res.status(404).json({ message: 'Failed to update the lessor' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lessor updated successfully',
      lessor: updatedLessor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export {
  registerLessor,
  loginLessor,
  lessorProfile,
  getAllLessors,
  getLessorsById,
  editLessor,
};
