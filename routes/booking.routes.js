import express from 'express';
const router = express.Router();
import {
  getBookingForLessor,
  createBooking,
  updateBookingStatus,
  queryBookings,
} from '../controllers/booking.controller.js';
import verifyToken from './../middleware/auth.middleware.js';

//* Get and request booking
router
  .route('/sport-center')
  .get(verifyToken, getBookingForLessor)
  .post(verifyToken, createBooking);

//* Update the status
router.route('/:bookingId/status').put(verifyToken, updateBookingStatus);

//* Querying booking
router.route('/status/filter').get(verifyToken, queryBookings);
export default router;
