import Booking from '../models/booking.js';
import Lessor from '../models/lessor.js';

//* Calculate Total Bookings by month

const totalBookingsByMonth = async (req, res) => {
  try {
    const lessorEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: lessorEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    const bookings = await Booking.aggregate([
      // Match the bookings for the specific lessor
      { $match: { lessor: lessor._id } },
      // Add fields for year and month extracted from the createdAt date
      {
        $addFields: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
      },
      // Group by year and month and count the number of bookings
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
        },
      },
      // Sort the results by year and month
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    res.status(200).json({
      message: 'success',
      month_booking: bookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { totalBookingsByMonth };
