import express from 'express';
const router = express.Router();
import {
  getComments,
  postComment,
  updateCommentStatus,
  commentForUser,
} from './../controllers/comment.controller.js';
import verifyToken from './../middleware/auth.middleware.js';

// Public Route for user
router.route('/public/comments').get(commentForUser);

// Route for admin
router.use(verifyToken);
router.route('/comments').get(getComments).post(postComment);
router.route('/comments/:commentId').put(updateCommentStatus);
export default router;
