import express from 'express';
const router = express.Router();

import {
  averageRating,
  ratingOverview,
} from './../controllers/rating.controller.js';

router.route('/average/reviews/:sportCenterId').get(averageRating);
router.route('/overviews/:sportCenterId').get(ratingOverview);

export default router;
