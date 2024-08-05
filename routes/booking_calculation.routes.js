import express from 'express';
const router = express.Router();

import { totalBookingsByMonth } from './../controllers/statistic_bookings.controller.js';
import verifyToken from './../middleware/auth.middleware.js';
import checkingAdminRole from '../middleware/checkRole.middleware.js';

router.use(verifyToken, checkingAdminRole);

router.route('/bookings/months').get(totalBookingsByMonth);
export default router;
