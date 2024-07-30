import Booking from './../models/booking.js';
import User from './../models/user.js';

//* Get all bookings for users

const getBookingForUser = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    const userBooking = await Booking.find({ user: user._id }).populate(
      'lessor',
      'sportcenter_name first_name last_name logo',
    );

    if (!userBooking || userBooking === 0) {
      return res
        .status(404)
        .json({ message: 'Bookings not found for this user', bookings: [] });
    }

    res.status(200).json({
      message: 'bookings found',
      amount_bookings: userBooking.length,
      user: user.name,
      booking: userBooking,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export { getBookingForUser };
