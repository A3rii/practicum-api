import express from 'express';
const router = express.Router();
import verifyToken from './../middleware/auth.middleware.js';

import { getBookingForUser } from './../controllers/user_booking.controller.js';

//* Booking For user

router.get('/booking', verifyToken, getBookingForUser);

export default router;
