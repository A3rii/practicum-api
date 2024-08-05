import express from 'express';
const router = express.Router();
import {
  getBookingForLessor,
  createBooking,
  updateBookingStatus,
  queryBookings,
  bookingsPagination,
  bookingAvailable,
} from '../controllers/booking.controller.js';
import verifyToken from './../middleware/auth.middleware.js';
import checkingAdminRole from '../middleware/checkRole.middleware.js';

//* For admin only
router
  .route('/lessors/:lessorID/time-slots/availability')
  .get(bookingAvailable);
// Get and request booking for user
router
  .route('/sport-center')
  .get(checkingAdminRole, getBookingForLessor)
  .post(createBooking);

router.use(verifyToken, checkingAdminRole);
// Update the status
router.route('/:bookingId/status').put(updateBookingStatus);

// Querying bookings
router.route('/status/filter').get(queryBookings);

// Limited bookings
router.route('/customer/pagination').get(bookingsPagination);

export default router;
