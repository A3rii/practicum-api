import SuperAdmin from './../models/superadmin.js';
import Lessor from '../models/lessor.js';
import User from '../models/user.js';
// Get Lessor for Super Admin
const moderatorLessors = async (req, res) => {
  try {
    const { lessorId } = req.query;
    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'moderator not found' });
    }

    let lessors;

    if (lessorId) {
      lessors = await Lessor.findById({ _id: lessorId });
    }

    lessors = await Lessor.find({});

    res
      .status(200)
      .json({ message: 'Lessor found', moderator: moderator.name, lessors });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all users

const allUsers = async (req, res) => {
  try {
    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'moderator not found' });
    }

    const users = await User.find({});
    res
      .status(200)
      .json({ message: 'Users found', total_users: users.length, users });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// update status for lessor registration
const updateLessorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { lessorId } = req.params;

    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'moderator not found' });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const lessor = await Lessor.findById(lessorId);

    if (!lessor) return res.status(404).json({ message: 'lessor not found' });

    lessor.status = status;
    lessor.time_availability = true;
    await lessor.save();

    res.status(200).json({ message: 'Lessor status updated', lessor });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// List an offical lessor for moderators
const lessorForSuperAdmin = async (req, res) => {
  try {
    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    // Use aggregation to join lessors with their ratings
    const lessorsWithRatings = await Lessor.aggregate([
      {
        $match: {
          status: 'approved', // Ensure we only fetch approved lessors
        },
      },
      {
        $lookup: {
          from: 'comments', // The collection where ratings (comments) are stored
          localField: '_id', // The field from the Lessor collection to match
          foreignField: 'postTo', // The field from the Comment collection to match
          as: 'ratings', // The name of the array that will hold the matched documents
        },
      },
      {
        $addFields: {
          filteredRatings: {
            $filter: {
              input: '$ratings',
              as: 'rating',
              cond: { $eq: ['$$rating.status', 'approved'] }, // Filter only approved ratings
            },
          },
        },
      },
      {
        $addFields: {
          overallRating: { $avg: '$filteredRatings.ratingValue' }, // Calculate the average of approved ratings
          sortedRatings: {
            $sortArray: {
              input: '$filteredRatings', // Sort the filtered ratings array
              sortBy: { ratingValue: -1, overallRating: -1 }, // Sort by ratingValue in descending order
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          first_name: 1,
          last_name: 1,
          sportcenter_name: 1,
          phone_number: 1,
          logo: 1,
          created_at: 1,
          overallRating: { $round: ['$overallRating', 1] }, // Round the overall rating to 1 decimal place
          ratings: {
            $map: {
              input: '$sortedRatings',
              as: 'rating',
              in: {
                ratingValue: '$$rating.ratingValue',
                status: '$$rating.status',
              },
            },
          },
        },
      },
      {
        $sort: {
          overallRating: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      lessor: lessorsWithRatings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const deleteLessor = async (req, res) => {
  try {
    const { lessorId } = req.params;
    const moderatorEmail = req.userData.email;

    // Check if the moderator exists
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    // Find and delete the lessor by ID
    const deletedLessor = await Lessor.findByIdAndDelete({ _id: lessorId });
    if (!deletedLessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    res
      .status(200)
      .json({ message: 'Lessor deleted successfully', deletedLessor });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const totalUsersByMonth = async (req, res) => {
  try {
    const moderatorEmail = req.userData.email;

    // Check if the moderator exists
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });
    if (!moderator) {
      return res.status(404).json({ message: 'Moderator not found' });
    }

    const users = await User.aggregate([
      {
        $addFields: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    res.status(200).json({ message: 'Success', month_users: users });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export {
  moderatorLessors,
  updateLessorStatus,
  lessorForSuperAdmin,
  deleteLessor,
  allUsers,
  totalUsersByMonth,
};
