import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User id reference must be provided'],
  },
  postTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lessor',
    required: true,
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  ratingValue: {
    type: Number,
    required: true,
    min: [1, 'Rating value must be at least 1'],
    max: [5, 'Rating value cannot exceed 5'],
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  },
  commentedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Comment = mongoose.model('Comments', commentSchema);
export default Comment;
