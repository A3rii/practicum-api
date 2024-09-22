import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Lessor from './../models/lessor.js';
import { v4 as uuidv4 } from 'uuid';
import { sendRegisterNotification } from './../listeners/socketManager.js';

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
    logo,
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

    // Time Validation

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
      logo,
    });

    // Save the lessor to the database
    const savedLessor = await lessor.save();
    sendRegisterNotification(savedLessor);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: userId, email: savedLessor.email, role: savedLessor.role },
      process.env.JWT_SECRET,
      {
        expiresIn: '4h',
      },
    );

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
        role: lessor.role,
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
    const lessors = await Lessor.find({});
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
const filterLessor = async (req, res) => {
  try {
    const {
      rating,
      timeAvailability,
      name,
      startTime,
      endTime,
      latitude,
      longitude,
    } = req.query;

    // Ensure latitude and longitude are numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate latitude and longitude
    const isLatValid = !isNaN(lat) && isFinite(lat);
    const isLngValid = !isNaN(lng) && isFinite(lng);

    const coordinates = isLatValid && isLngValid ? [lng, lat] : null;

    // Parse rating into an array if provided
    const ratingArray =
      rating &&
      (Array.isArray(rating)
        ? rating.map((r) => parseInt(r))
        : rating.split(',').map((r) => parseInt(r)));

    const aggregationPipeline = [
      // Conditionally include $geoNear if coordinates are valid
      ...(coordinates
        ? [
            {
              $geoNear: {
                near: {
                  type: 'Point',
                  coordinates: coordinates,
                },
                distanceField: 'distance',
                spherical: true,
              },
            },
            {
              $limit: 1,
            },
          ]
        : []),

      // Match stage to filter approved lessors and other criteria
      {
        $match: {
          status: 'approved',
          ...(name && {
            sportcenter_name: {
              $regex: name,
              $options: 'i',
            },
          }),
          ...(timeAvailability !== undefined && {
            time_availability: timeAvailability === 'true',
          }),
        },
      },
      {
        // Lookup ratings from the 'comments' collection
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postTo',
          as: 'ratings',
        },
      },
      {
        // Filter the ratings to only include approved ones
        $addFields: {
          filteredRatings: {
            $filter: {
              input: '$ratings',
              as: 'rating',
              cond: { $eq: ['$$rating.status', 'approved'] },
            },
          },
        },
      },
      {
        // Add fields for overall rating and floored rating
        $addFields: {
          overallRating: { $avg: '$filteredRatings.ratingValue' },
          flooredRating: { $floor: { $avg: '$filteredRatings.ratingValue' } },
        },
      },
      // Apply operating hours filtering if startTime and endTime are provided
      ...(startTime && endTime
        ? [
            {
              $match: {
                'operating_hours.open': { $lte: startTime },
                'operating_hours.close': { $gte: endTime },
              },
            },
          ]
        : []),
      // Match based on flooredRating if ratingArray is provided
      ...(ratingArray
        ? [
            {
              $match: {
                flooredRating: { $in: ratingArray },
              },
            },
          ]
        : []),
      {
        // Project the necessary fields to return in the result
        $project: {
          sportcenter_name: 1,
          address: 1,
          time_availability: 1,
          operating_hours: 1,
          facilities: 1,
          logo: 1,
          overallRating: { $round: ['$overallRating', 1] }, // Round rating to one decimal
          distance: 1,
          ratings: {
            $map: {
              input: '$filteredRatings',
              as: 'rating',
              in: {
                ratingValue: '$$rating.ratingValue',
                status: '$$rating.status',
              },
            },
          },
        },
      },
    ];

    const lessorsWithFilters = await Lessor.aggregate(aggregationPipeline);

    return res.status(200).json({
      success: true,
      lessors: lessorsWithFilters,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Lessor by their id
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
  filterLessor,
};
