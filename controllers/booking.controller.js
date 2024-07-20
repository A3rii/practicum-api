import Booking from '../models/booking.js';
import Lessor from '../models/lessor.js';
import moment from 'moment';

const getBookingForLessor = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }
    const bookings = await Booking.find({ lessor: lessor._id })
      .populate('lessor', 'first_name last_name')
      .populate('user', 'name email phone_number');
    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: 'Bookings not found for this lessor' });
    }

    res.status(200).json({ message: 'Success', bookings: bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createBooking = async (req, res) => {
  const {
    user,
    outside_user,
    lessor,
    facility,
    court,
    date,
    startTime,
    endTime,
  } = req.body;

  if (!user || !lessor || !facility || !court || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  // Validate time format using moment
  if (
    !moment(startTime, 'hh:mm a', true).isValid() ||
    !moment(endTime, 'hh:mm a', true).isValid()
  ) {
    return res
      .status(400)
      .json({ message: 'Start time and end time must be in hh:mm a format' });
  }

  // Validate end time is after start time
  if (moment(endTime, 'hh:mm a').isBefore(moment(startTime, 'hh:mm a'))) {
    return res
      .status(400)
      .json({ message: 'End time must be after start time' });
  }
  try {
    const newBooking = new Booking({
      user,
      outside_user,
      lessor,
      facility,
      court,
      date,
      startTime,
      endTime,
    });

    const savedBooking = await newBooking.save();
    res
      .status(201)
      .json({ message: 'Booking saved successfully', booking: savedBooking });
  } catch (err) {
    console.error('Error creating booking:');
    res.status(500).json({ message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (err) {
    console.error('Error updating booking status:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const queryBookings = async (req, res) => {
  try {
    const userEmail = req.userData.email;
    const lessor = await Lessor.findOne({ email: userEmail });

    if (!lessor) {
      return res.status(404).json({ message: 'Lessor not found' });
    }

    const { status } = req.query;
    const query = { lessor: lessor._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query);

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        message: `No bookings found for status ${status} `,
        bookings: [],
      });
    }

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export {
  getBookingForLessor,
  createBooking,
  updateBookingStatus,
  queryBookings,
};
