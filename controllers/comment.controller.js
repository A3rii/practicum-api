import Comment from './../models/comment.js';
import SuperAdmin from './../models/superadmin.js';
import User from './../models/user.js';

const getComments = async (req, res) => {
  try {
    const { sportCenterId } = req.query; // Get the sport center ID from query parameters
    const moderatorEmail = req.userData.email; // Get the moderator email from the authenticated user

    // Find the moderator in the database
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });

    if (!moderator) {
      return res.status(404).json({
        message: 'Could not find moderator',
      });
    }

    // If a sportCenterId is provided, fetch comments specific to that sport center
    let comments;
    if (sportCenterId) {
      comments = await Comment.find({ postTo: sportCenterId })
        .populate('postBy', 'name email phone_number')
        .populate('postTo', 'sportcenter_name logo');
    } else {
      // If no sportCenterId is provided, fetch all comments
      comments = await Comment.find({})
        .populate('postBy', 'name email phone_number')
        .populate('postTo', 'sportcenter_name logo');
    }

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        message: 'No comments found',
        comments: [],
      });
    }

    res.status(200).json({
      message: 'Success',
      comments,
    });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching comments' });
  }
};
const updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;

    const moderatorEmail = req.userData.email;
    const moderator = await SuperAdmin.findOne({ email: moderatorEmail });

    if (!moderator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const comment = await Comment.findById(commentId)
      .populate('postBy', 'name email phone_number')
      .populate('postTo', 'first_name last_name');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.status = status;
    await comment.save();
    res.status(200).json({ message: 'Comment status updated', comment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const postComment = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) return res.status(404).status({ message: 'User not found' });

    const { postTo, comment } = req.body;
    if (!postTo || !comment) {
      return res.status(400).status({
        message: 'Missing required field',
      });
    }

    const newComment = new Comment({
      postBy: user._id,
      postTo,
      comment,
    });
    const saveComment = await newComment.save();
    res.status(201).json({
      message: 'Comment Posted Successfully',
      comment: saveComment,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const commentForUser = async (req, res) => {
  try {
    const { sportCenterId } = req.query;

    // Get all  doc in database
    const comments = await Comment.find({ postTo: sportCenterId })
      .populate('postBy', 'name')
      .populate('postTo', 'sportcenter_name');

    if (!comments || comments.length === 0) {
      return res.status(200).json({
        message: 'Comments not found',
      });
    }

    res.status(200).json({
      message: 'Success',
      comments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { getComments, postComment, updateCommentStatus, commentForUser };
